/*********************************************************************
** ---------------------- Copyright notice ---------------------------
** This source code is part of the EVASoft project
** It is property of Alain Boute Ingenierie - www.abing.fr and is
** distributed under the GNU Public Licence version 2
** Commercial use is submited to licencing - contact eva@abing.fr
** -------------------------------------------------------------------
**        File : CodeEditor.mjs
** Description : It's a code editor
**      Author : Luc TORRES
**     Created : Apr 2022
*********************************************************************/
"use strict";

// include
import conf from './HtmlEditorConfig.js';

// global variable
let mouseIsDown = false;
let confCommand = {};
let selRange;
let elmClicked;

// function
let getCursorOffset = (element) => {
	let cursorOffset = 0;
	if (element == undefined) {
		return -3;
	}
	let nodeList = element.childNodes;

	let selection = window.getSelection();
	if (selection.rangeCount == 0) return -1;

	let range = selection.getRangeAt(0);

	let i = 0;
	let found = false;
	while (i < nodeList.length && found == false) {
		// look nodeList[i]
		if (nodeList[i] === range.startContainer) {
			cursorOffset += range.startOffset;
			found = true;
		}
		else if (nodeList[i].nodeName == "#text") {
			cursorOffset += nodeList[i].length;
		}
		else {
			let offset = getCursorOffset(nodeList[i]);
			if (offset == -2) {
				cursorOffset += nodeList[i].innerText.length;
			}
			else if (offset == -3) {
				return -3;
			}
			else {
				cursorOffset += offset;
				found = true;
			}
		}

		i++;
	}
	
	if (found) {
		return cursorOffset;
	}
	else {
		return -2;
	}
}

let setCursorOffset = (element, offset) => {
	if (offset == 0) {
		let selection = window.getSelection(0);
		let range = selection.getRangeAt(0);
		range.setStart(element, offset);
		range.setEnd(element, offset);
		// selection.addRange(range);
	}

	if (offset < 0) {
		return;
	}

	let nodeList = element.childNodes;

	let i = 0;
	while (i < nodeList.length) {
		if (nodeList[i].nodeName == "#text") {
			if (nodeList[i].length < offset) {
				offset -= nodeList[i].length;
			}
			else {
				// set cursor
				let selection = window.getSelection(0);
				let range;
				if (selection.rangeCount == 0) {
					// create range
					range = document.createRange();
				}
				else {
					range = selection.getRangeAt(0);
				}
				range.setStart(nodeList[i], offset);
				range.setEnd(nodeList[i], offset);

				return -1;
			}
		}
		else {
			let res = setCursorOffset(nodeList[i], offset);
			if (res == -1) {
				// end function
				return -1;
			}
			else {
				offset = res;
			}
		}

		i++;
	}
	
	return offset;
}

// class
class CodeEditor {
	constructor(textarea, type) {
		this.conf = conf.lsClass[type];
		this.textarea = textarea;

		let template = document.querySelector("#EVA_CodeEditor_template");
		this.wrap = document.importNode(template.content.querySelector(".EVA_CodeEditor_wrap"), true);
		this.lineNumber = this.wrap.querySelector(".EVA_CodeEditor_editor > div:first-child");

		this.contentEditable = this.wrap.querySelector("[contentEditable]");
		// this.contentEditable.style.height = this.textarea.offsetHeight + "px";
		this.contentEditable.style.width = this.textarea.offsetWidth + "px";

		this.bottomToolbar = this.wrap.querySelector(".EVA_CodeEditor_wrap > div:last-child");
		
		this.contentEditable.innerText = this.textarea.innerHTML;
		this.contentEditable.classList.add("EVA_CodeEditor_contenteditableCode");

		this.textarea.style.display = "none";
		this.textarea.insertAdjacentElement("beforebegin", this.wrap);

		this.beautify();
		this.updateNumRow();
		this.setLimitHeight();

		// set event
		// action make once after inactivity
		this.timoutId;
		this.timout = () => {
			setTimeout(() => {
				this.save();
				if (this.inCodeMode()) this.updateNumRow();
			}, 100);
			
			clearTimeout(this.timoutId);
			this.timoutId = setTimeout(() => {
				if (this.inCodeMode()) {
					this.syntaxHighlighter();
				}
				else {
					this.display();
				}
			}, 1000);
		}
		this.contentEditable.addEventListener("input", this.timout);

		this.contentEditable.addEventListener("focus", () => {
			document.execCommand("defaultParagraphSeparator", false, this.inCodeMode() ? "div" : "p");
		});

		this.contentEditable.addEventListener("dblclick", () => {
			if (!this.inCodeMode()) return;

			let selObj = window.getSelection();
			if (selObj.rangeCount > 0) {
				let range = selObj.getRangeAt(0);
				let textSelected = range.endContainer.textContent.substring(0, range.endOffset);
				let match = /\s+$/.exec(textSelected);
				range.setEnd(range.endContainer, range.endOffset - (match ? match[0].length : 0));
			}
		});

		// rezise content editable
		this.contentEditable.addEventListener("mousedown", () => {
			mouseIsDown = true;
		});
		window.addEventListener("mousemove", () => {
			if (!mouseIsDown) return;
			this.rezise();
		});
		window.addEventListener("mouseup", () => {
			this.rezise();
			mouseIsDown = false;
		});

		window.addEventListener("resize", () => {
			this.setLimitHeight();
		});

		// pretty print btn
		this.bottomToolbar.getElementsByTagName("button")[0].addEventListener("click", () => {
			this.beautify();
		});

		// line numbers align to line code
		this.lineNumber.addEventListener("scroll", () => {
			this.contentEditable.scrollTop = this.lineNumber.scrollTop;
		});
		this.contentEditable.addEventListener("scroll", () => {
			this.lineNumber.scrollTop = this.contentEditable.scrollTop;
		});

		// shortcut
		this.contentEditable.addEventListener("paste", evt => {
			if (!this.inCodeMode()) return;

			// stop evt
			evt.preventDefault();

			// get text to paste
			let paste = (evt.clipboardData || window.clipboardData).getData('text').split('\n');

			// get row where cursor is
			let row = this.getTopDiv(window.getSelection().getRangeAt(0).startContainer);

			// remove selection
			document.execCommand("insertText", false, '');

			// split this row by the cursor offset
			let cursorOffset = getCursorOffset(row);
			if (cursorOffset == -3) cursorOffset = 0;
			let rowPart = [
				row.innerText.substring(0, cursorOffset),
				row.innerText.substring(cursorOffset, row.innerText.length).replaceAll('\n', ''),
			];

			if (paste.length == 1) {
				document.execCommand("insertText", false, paste[0]);
			}
			else {
				// insert first row
				row.innerText = rowPart[0] + paste[0];
				// insert rest of row
				let lastRow = row;
				for (let i = 1; i < paste.length; i++) {
					// create div
					let row = document.createElement('div');
					// fill div
					row.innerText = paste[i];
					// insert div after last row
					lastRow.insertAdjacentElement('afterend', row);
					lastRow = row;
				}
				// insert last row
				lastRow.innerText = lastRow.innerText + rowPart[1];

				// set focus on row
				setCursorOffset(lastRow, paste[paste.length - 1].length);
			}
		});
		this.contentEditable.addEventListener("keydown", evt => {
			this.timout();

			let isMac = navigator.platform.match("Mac");

			if ((isMac ? evt.metaKey : evt.ctrlKey)/* && conf.language == "fr"*/) {
				if (evt.key == "s") {
					if (!this.inCodeMode()) this.edit("underline");
					evt.preventDefault();
				}
			}

			if (!this.inCodeMode()) return;

			if (evt.key == "Enter") {
				evt.preventDefault();

				// enter
				let container = this.getTopDiv(window.getSelection().getRangeAt(0).startContainer);
				if (!container) return;
				let cursorOffset = getCursorOffset(container);

				let isInCurlyBraces = container.innerText.substring(cursorOffset - 1, cursorOffset + 1) == '{}';

				// take text after cursor
				let text = container.innerText.substring(cursorOffset, container.innerText.length);
				container.innerText = container.innerText.substring(0, cursorOffset);

				let indentLevel = /^\t*/g.exec(container.innerText)[0].length;
				
				if (isInCurlyBraces) {
					// create rows
					let lineCursor = document.createElement("div");
					lineCursor.innerText = '\t';
					let lineClose = document.createElement("div");
					lineClose.innerText = '';

					// indent
					for (let i = 0; i < indentLevel; i++) {
						lineClose.innerText += '\t';
						lineCursor.innerText += '\t';
					}

					lineClose.innerText += text;

					// insert rows
					container.insertAdjacentElement("afterend", lineClose);
					container.insertAdjacentElement("afterend", lineCursor);
					
					setCursorOffset(lineCursor, indentLevel + 1);

					return;
				}

				// else
				let newLine = document.createElement("div");
				newLine.innerText = "";

				// increase indent level ?
				if (container.innerText.split("").reverse()[0] == "{") indentLevel++;

				// indent
				for (let i = 0; i < indentLevel; i++) {
					newLine.innerText += '\t';
				}
				newLine.innerText += text;

				container.insertAdjacentElement("afterend", newLine);

				setCursorOffset(newLine, indentLevel);
			}
			else if (evt.key == "Tab") {
				// tab
				evt.preventDefault();

				// add tabulation
				let range = window.getSelection().getRangeAt(0);
				if (range.collapse) {
					document.execCommand("insertText", false, "\t");
				}
			}
			else if (evt.key == "{" || evt.key == "(" || evt.key == "[" || evt.key == "\'" || evt.key == "\"") {
				evt.preventDefault();
			
				let asso = {
					"{": "}",
					"(": ")",
					"[": "]",
					"\'": "\'",
					"\"": "\""
				}

				// place cursor in 2 char created
				let range = window.getSelection().getRangeAt(0);
				if (range.collapsed) {
					document.execCommand("insertText", false, evt.key + asso[evt.key]);

					// give selection
					range = window.getSelection().getRangeAt(0);
					range.setEnd(range.endContainer, range.endOffset - 1);
					range.collapse(false);
				}
				else {
					let text = range.toString();
					document.execCommand("insertText", false, evt.key + text + asso[evt.key]);

					// give selection
					range = window.getSelection().getRangeAt(0);
					range.setStart(range.startContainer, range.startOffset - text.length - 1);
					range.setEnd(range.endContainer, range.endOffset - 1);
				}
			}
		});
	}

	// set content editable max height to 80% of window screen
	setLimitHeight() {
		this.contentEditable.style.minHeight = window.innerHeight * 0.2 + 'px';
		this.lineNumber.style.minHeight = this.contentEditable.style.minHeight;
		this.contentEditable.style.maxHeight = window.innerHeight * 0.8 + 'px';
		this.lineNumber.style.maxHeight = this.contentEditable.style.maxHeight;
	}

	inCodeMode() {
		return (!(this instanceof Wysiwyg) || this.codeIsShow);
	}

	rezise() {
		// width
		this.wrap.style.width = this.contentEditable.style.width.split("px")[0] * 1 + this.lineNumber.offsetWidth + 4 + "px";
		// height
		// this.wrap.style.height = (this instanceof Wysiwyg ? this.toolbar.offsetHeight : 0) + this.contentEditable.style.height.split("px")[0] * 1 + this.bottomToolbar.offsetHeight + 4 + "px";

		// this.lineNumber.style.height = this.contentEditable.style.height;
	}

	getTopDiv(element) {
		if (!this.inCodeMode()) return;
		
		while (element !== this.contentEditable) {
			if (element.nodeName == "DIV" && element.parentElement == this.contentEditable) {
				return element;
			}
			else {
				element = element.parentElement;
				
				if (element.nodeName == 'HTML') {
					return;
				}
			}
		}
	
		return element.firstChild;
	}

	save() {
		if (!this.inCodeMode()) return;
		
		this.textarea.value = this.minify(this.getCode());
	}

	updateNumRow() {
		if (!this.inCodeMode()) return;

		let nbNum = this.lineNumber.querySelectorAll("div").length;
		let nbRow = this.contentEditable.querySelectorAll("div").length;
		let dif = nbRow - nbNum;

		// always div in divCE
		if (!nbRow) {
			// document.execCommand("formatBlock", false, "div");
			let newLine = document.createElement("div");
			newLine.innerText = this.contentEditable.innerText;
			this.contentEditable.innerHTML = "";
			this.contentEditable.appendChild(newLine);

			return;
		}

		// show num of row only if row exist
		for (let i = 0; i < Math.abs(dif, 2); i++) {
			if (dif < 0) {
				// remove num
				this.lineNumber.querySelector("div:last-child").remove();
			}
			else if (dif > 0) {
				// add num
				let num = document.createElement("div");
				num.innerText = this.lineNumber.querySelector("div:last-child").innerText * 1 + 1;
				this.lineNumber.insertAdjacentElement("beforeEnd", num);
			}
		}
	}

	getCode() {
		if (!this.inCodeMode()) return;

		let lsDiv = this.contentEditable.childNodes;
		let code = [];
		for (let i = 0; i < lsDiv.length; i++) {
			let line = lsDiv[i].innerText;
			// remove last "\n" if exist
			if (line[line.length - 1] == "\n") line = line.substring(0, line.length - 1);

			code.push(line);
		}

		return code.join("\n");
	}

	setCode(code) {
		if (!this.inCodeMode()) return;

		let lsLine = code.split("\n");
		this.contentEditable.innerHTML = "";
		lsLine.forEach(line => {
			let newLine = document.createElement("div");

			newLine.innerText = line;

			this.contentEditable.appendChild(newLine);
		});

		this.updateNumRow();
	}

	getCodeLang() {
		return (this.conf.codeLanguage || conf.lsClass[this.conf.code].codeLanguage);
	}

	findBlock(str) {
		const LANG = this.getCodeLang();
		const LS_BLOCK = conf.lsCodeLanguage[LANG].lsBlockNoMinify;
		const LS_KEYWORD = conf.lsCodeLanguage[LANG].syntaxColor.const;

		let firstMatch = {index: Infinity};

		// search keyword
		LS_KEYWORD.forEach(keyWord => {
			// generate regexp
			let regex = new RegExp(`(?<![a-zA-Z0-9])(${keyWord.lsWord.join("|")})(?![a-zA-Z0-9])`);
			let match = regex.exec(str);
			if (match) {
				if (match.index < firstMatch.index) {
					firstMatch = {type: "simple", block: match[0], index: match.index, color: keyWord.color};
				}
			}
		});

		// search block
		let currentBlock;
		let i = 0;
		while (currentBlock == undefined && i < str.length) {
			let j = 0;
			while (j < LS_BLOCK.length) {
				let block = LS_BLOCK[j];
				if (str.substring(i, i + block.start.length) == block.start) {
					// block finded
					currentBlock = block;
					if (i < firstMatch.index) {
						firstMatch = {type: "double", block: block, index: i, color: block.type};
					}
					break;
				}

				j++;
			}

			i++;
		}
		
		return firstMatch;
	}

	findEndingBlock(str, block) {
		let model = block.end;
		// check line
		let index = str.indexOf(model);
		if (index !== -1) {
			// check escaped
			if (block.escape !== undefined) {
				// count number of escape char
				let counter = 0; ////////////////////////////////////////////////// work only with length ok 1 char for escaped char
				let k = 1;
				while (true) {
					if (str[index - k] == block.escape) {
						counter++;
						k++;
					}
					else break;
				}
				
				if (counter % 2 == 0) {
					return index + model.length;
				}
				else {
					return this.findEndingBlock(str.substring(index + model.length), block);
				}
			}
			else {
				return index + model.length;
			}
		}
		else {
			// not finded
			return -1;
		}
	}

	minify = (code) => {
		let lang = this.getCodeLang();
		let lsBlockNoMinify = conf.lsCodeLanguage[lang].lsBlockNoMinify;

		let lsLine = code.trim().split('\n');

		for (let i = 0; i < lsLine.length; i++) {
			lsLine[i] = lsLine[i].trimStart();
	
			for (let j = 0; j < lsLine[i].length; j++) {
				// find starting block
				let currentBlock;
				for (let k = 0; k < lsBlockNoMinify.length; k++) {
					let block = lsBlockNoMinify[k];
					if (lsLine[i].substring(j, j + block.start.length) == block.start) {
						j += block.start.length;
						currentBlock = block;
						break;
					}
				}
				if (currentBlock == undefined) continue;

				// find ending block
				let model = currentBlock.end;
				if (model == "\n") break;	// go next line

				while (i < lsLine.length) {
					// check line
					let index = lsLine[i].substring(j).indexOf(model);
					if (index !== -1) {
						// check escaped
						if (currentBlock.escape !== undefined) {
							// count number of escape char
							let counter = 0; ////////////////////////////////////////////////// work only with length ok 1 char for escaped char
							let k = 1;
							while (true) {
								if (lsLine[i][j + index - k] == currentBlock.escape) {
									counter++;
									k++;
								}
								else break;
							}
							
							j += index + model.length;
							if (counter % 2 == 0) {
								break;
							}
						}
						else {
							j += index + model.length;
							break;
						}
					}
					else {
						// go next line
						j = 0;
						i++;
					}
				}
				if (i == lsLine.length) break;
			}
			if (i == lsLine.length) break;

			// remove double lines
			if (lsLine[i].length == 0) {
				// remove all empty next lines
				while (true) {
					if (lsLine[i + 1] == undefined) break;
					if (lsLine[i + 1].length == 0) {
						// remove next line
						lsLine.splice(i + 1, 1);
					}
					else break;
				}
				if (i == lsLine.length) break;
			}

			lsLine[i] = lsLine[i].trimEnd();
		}
	
		return lsLine.join("\n");
	}

	/**
		beautify : code indented + code colored
	*/
	beautify() {
		if (!this.inCodeMode()) return;

		let code = this.textarea.value;
		let lang = this.getCodeLang();
		let lsBlockNoMinify = conf.lsCodeLanguage[lang].lsBlockNoMinify;
		let lsStrToIndent = conf.lsCodeLanguage[lang].lsStrToIndent;
		// sort lsStrToIndent by str length: long to short
		lsStrToIndent.sort((a, b) => {
			return b.str.length - a.str.length;
		});

		let lsLine = code.trim().split('\n');

		let indentLevel = 0;
		for (let i = 0; i < lsLine.length; i++) {
			// set indent level
			for (let j = 0; j < indentLevel; j++) {
				lsLine[i] = "\t" + lsLine[i];
			}

			// update indent level
			let lineIndentDif = 0;
			for (let j = 0; j < lsLine[i].length; j++) {
				// find alter indent block
				for (let k = 0; k < lsStrToIndent.length; k++) {
					let block = lsStrToIndent[k];

					if (lsLine[i].substring(j, j + block.str.length) == block.str) {
						j += block.str.length - 1;
						lineIndentDif += (block.action == "indent") ? 1 : -1;
						break;
					}
				}

				// find starting block
				let currentBlock;
				for (let k = 0; k < lsBlockNoMinify.length; k++) {
					let block = lsBlockNoMinify[k];
					if (lsLine[i].substring(j, j + block.start.length) == block.start) {
						j += block.start.length;
						currentBlock = block;
						break;
					}
				}
				if (currentBlock == undefined) continue;

				// find ending block
				let model = currentBlock.end;
				if (model == "\n") break;	// go next line

				while (i < lsLine.length) {
					// check line
					let index = lsLine[i].substring(j).indexOf(model);
					if (index !== -1) {
						// check escaped
						if (currentBlock.escape !== undefined) {
							// count number of escape char
							let counter = 0; ////////////////////////////////////////////////// work only with length ok 1 char for escaped char
							let k = 1;
							while (true) {
								if (lsLine[i][j + index - k] == currentBlock.escape) {
									counter++;
									k++;
								}
								else break;
							}
							
							j += index;
							if (counter % 2 == 0) {
								break;
							}
						}
						else {
							j += index;
							break;
						}
					}
					else {
						// go next line
						j = 0;
						i++;
					}
				}
				if (i == lsLine.length) break;
			}
			if (i == lsLine.length) break;

			// max 1 indent dif
			if (lineIndentDif < -1) lineIndentDif = -1;
			else if (lineIndentDif > 1) lineIndentDif = 1;

			indentLevel += lineIndentDif;
			if (lineIndentDif < 0) {
				for (let j = 0; j < Math.abs(lineIndentDif); j++) {
					// remove indent
					lsLine[i] = lsLine[i].substring(1);
				}
			}
		}

		this.setCode(lsLine.join("\n"));

		// this.save(); ////////////////////////////////////////////////////////////////////////////////////////// jolie mais pas modifier le textarea
		this.syntaxHighlighter();
	}

	syntaxHighlighter() {
		if (!this.inCodeMode()) return;

		let selObj = window.getSelection();
		let range;
		let divCursor;
		if (selObj.rangeCount > 0) {
			range = selObj.getRangeAt(0);
			if (!range.collapsed) return;
			divCursor = this.getTopDiv(range.startContainer);
		}

		let code = this.getCode();
		let lsLine = code.split('\n');

		let currentDoubleBlock;
		for (let i = 0; i < lsLine.length; i++) {
			const lineText = lsLine[i];
			let newLine = document.createElement("div");

			const addSpan = (text, color) => {
				if (text.length == 0) return;
	
				let span = document.createElement("span");
				if (color) span.style.color = color
				span.innerText = text;
				newLine.appendChild(span);
			}
			const replaceLine = () => {
				let lsDiv = this.contentEditable.getElementsByTagName("div");
				let cursorOffset;
				if (lsDiv[i] == divCursor) {
					cursorOffset = getCursorOffset(lsDiv[i]);
				}

				// update line
				this.contentEditable.replaceChild(newLine, lsDiv[i]);

				if (cursorOffset) {
					setCursorOffset(newLine, cursorOffset);
				}
			}
			
			let j = 0;
			if (currentDoubleBlock) {
				let blockEndIndex = this.findEndingBlock(lineText.substring(j), currentDoubleBlock.block);
				if (blockEndIndex == -1) {
					// not finded
					addSpan(lineText, conf.lsColor[currentDoubleBlock.color]);
					replaceLine();
					continue;
				}
				addSpan(lineText.substring(j, j + blockEndIndex), conf.lsColor[currentDoubleBlock.color]);
				currentDoubleBlock = undefined;
				j += blockEndIndex;
			}
			while (j < lineText.length) {
				// find next block / keyword
				let block = this.findBlock(lineText.substring(j));

				addSpan(lineText.substring(j, j + block.index));
				if (block.index == Infinity) break;

				j += block.index;
				if (block.type == "simple") {
					addSpan(lineText.substring(j, j + block.block.length), conf.lsColor[block.color]);
					j += block.block.length;
				}
				else if (block.type == "double") {
					if (block.block.end == "\n") {
						addSpan(lineText.substring(j), conf.lsColor[block.color]);
						break;
					}

					addSpan(lineText.substring(j, j + block.block.start.length), conf.lsColor[block.color]);
					j += block.block.start.length;
					let blockEndIndex = this.findEndingBlock(lineText.substring(j), block.block);
					if (blockEndIndex == -1) {
						blockEndIndex = Infinity;
						currentDoubleBlock = block;
					}
					addSpan(lineText.substring(j, j + blockEndIndex), conf.lsColor[block.color]);
					j += blockEndIndex;
				}
			}

			replaceLine();
		}
	}
}

class Wysiwyg extends CodeEditor {
	constructor(textarea, type) {
		super(textarea, type);

		this.contentEditable.classList.remove("EVA_CodeEditor_contenteditableCode");
		this.contentEditable.classList.add("EVA_CodeEditor_contenteditableHtml");

		this.toolbar = document.createElement("div");
		this.toolbar.className = "EVA_CodeEditor_toolbar";

		// insert btn in toolbar
		let addBtn = (element, title, name) => {
			// define btn
			let btn = document.createElement("button");
			btn.className = "EVA_CodeEditor_tbElement EVA_CodeEditor_" + name;
			btn.type = "button";
	
			// get content
			let content = element.contentLanguage[conf.language];
			if (content == undefined) {
				content = element.content;
			}
	
			btn.innerHTML = content;
			if (title) {
				btn.title = element.title[conf.language];
			}
			btn.addEventListener(element.event.typeOfListner, () => {
				element.event.function(this);
			});
			// add btn to toolbar
			this.toolbar.lastElementChild.appendChild(btn);
		}
		this.conf.toolbar.lsBtn.forEach(e => {
			// create tbPart
			let tbPart = document.createElement("div");
			tbPart.className = "EVA_CodeEditor_tbPart";
			// add tbPart in location
			this.toolbar.appendChild(tbPart);
			// loop on e
			e.forEach(f => {
				let name = f;

				// fill tbPart with btn
				if (conf.btnDef[f][0] == undefined) {
					// f is object
					addBtn(conf.btnDef[f], true, name);
				}
				else {
					// f is array
					// loop on f
					conf.btnDef[f].forEach(g => {
						// add g
						if (g.option == undefined) {
							if (g.title == undefined) {
								// g is btn
								addBtn(g, false, name);
							}
							else {
								// g is title
								this.toolbar.lastElementChild.title = g.title[conf.language];
							}
						}
						else {
							// g is select
							let select = document.createElement("select");
							select.className = "EVA_CodeEditor_tbList";
							select.name = f;
							select.addEventListener(g.event.typeOfListner, () => {
								g.event.function(this);
							});
							// add select in newLocation
							this.toolbar.lastElementChild.appendChild(select);
							// loop on option
							g.option.forEach(h => {
								// create option
								let option = document.createElement("option");

								// get content
								let content = h.contentLanguage[conf.language];
								if (content == undefined) {
									content = h.content;
								}

								option.innerText = content;
								option.value = h.value;
								this.toolbar.lastElementChild.lastElementChild.appendChild(option);
							});
						}
					});
				}
			});

			// add pipe separator
			// create pipe separator
			let pipeSeparator = document.createElement("div");
			pipeSeparator.className = "EVA_CodeEditor_separator";
			pipeSeparator.innerText = "|";
			// add pipe separator in location
			this.toolbar.appendChild(pipeSeparator);
		});
		// remove last pipe separator
		this.toolbar.lastChild.remove();

		this.wrap.insertAdjacentElement("afterbegin", this.toolbar);

		this.contentEditable.innerHTML = this.textarea.value;

		this.codeIsShow = false;
		this.lineNumber.style.display = "none";
		this.bottomToolbar.style.display = "none";

		// set event
		// shortcut
		this.contentEditable.addEventListener("keydown", evt => {
			if (this.inCodeMode()) return;

			let isMac = navigator.platform.match("Mac");

			if ((isMac ? evt.metaKey : evt.ctrlKey)/* && conf.language == "fr"*/) {
				if (evt.key == "g") {
					this.edit("bold");
					evt.preventDefault();
				}
			}

			else if (evt.shiftKey) {
				if (evt.key == "Tab") {
					this.edit("outdent");
					evt.preventDefault();
				}
			}

			else if (evt.key == "Tab") {
				this.edit("indent");
				evt.preventDefault();
			}
		});

		// popup
		this.contentEditable.addEventListener("click", evt => {
			if (this.inCodeMode()) return;

			this.display();

			// link or img
			elmClicked = evt.target;
			if (elmClicked.nodeName == "A") {
				popupImgLinkInfo.show();
				confCommand.myThis = this;
			}
			else if (elmClicked.nodeName == "IMG") {
				resizeableDiv.show();
				// popupImgLinkInfo.show();
				confCommand.myThis = this;
			}
		});
	}

	/**
		save : copy div contentEditable content in textarea
	*/
	save() {
		if (this.inCodeMode()) super.save();
		else this.textarea.value = this.minify(this.contentEditable.innerHTML);
	}

	parser() {
		let code = this.textarea.value;
		let lang = this.getCodeLang();
		let lsBlockNoMinify = conf.lsCodeLanguage[lang].lsBlockNoMinify;
		let lsBlockToParse = conf.lsCodeLanguage[lang].lsBlockToParse;

		let lsLine = code.trim().split('\n');

		for (let i = 0; i < lsLine.length; i++) {
			for (let j = 0; j < lsLine[i].length; j++) {
				// split row if good block
				for (let k = 0; k < lsBlockToParse.length; k++) {
					let block = lsBlockToParse[k];
					let lsModel = [
						`<${block}`,
						`</${block}`,
					];

					let isBreaked = false;
					for (let l = 0; l < lsModel.length; l++) {
						let model = lsModel[l];
						if (lsLine[i].substring(j, j + model.length) == model) {
							// add "\n" after ">"
							let index = lsLine[i].substring(j).indexOf(">");

							let before = lsLine[i].substring(0, j);
							let center = lsLine[i].substring(j, j + index + 1);
							let after = lsLine[i].substring(j + index + 1);
							let nbCharAdded = 0;
							if (before.length !== 0) {
								before += "\n";
								nbCharAdded++;
							}
							if (after.length !== 0) {
								center += "\n";
								nbCharAdded++;
							}
							lsLine[i] = before + center + after;

							j += index + 1 + nbCharAdded;
							isBreaked = true;
							break;
						}
						if (isBreaked) break;
					}
					if (isBreaked) break;
				}

				// find starting block
				let currentBlock;
				for (let k = 0; k < lsBlockNoMinify.length; k++) {
					let block = lsBlockNoMinify[k];
					if (lsLine[i].substring(j, j + block.start.length) == block.start) {
						j += block.start.length;
						currentBlock = block;
						break;
					}
				}
				if (currentBlock == undefined) continue;

				// find ending block
				let model = currentBlock.end;
				if (model == "\n") break;	// go next line

				while (i < lsLine.length) {
					// check line
					let index = lsLine[i].substring(j).indexOf(model);
					if (index !== -1) {
						// check escaped
						if (currentBlock.escape !== undefined) {
							// count number of escape char
							let counter = 0; ////////////////////////////////////////////////// work only with length ok 1 char for escaped char
							let k = 1;
							while (true) {
								if (lsLine[i][j + index - k] == currentBlock.escape) {
									counter++;
									k++;
								}
								else break;
							}
							
							j += index + model.length;
							if (counter % 2 == 0) {
								break;
							}
						}
						else {
							j += index + model.length;
							break;
						}
					}
					else {
						// go next line
						j = 0;
						i++;
					}
				}
				if (i == lsLine.length) break;
			}
			if (i == lsLine.length) break;
		}
	
		return lsLine.join("\n");
	}

	/**
		switchCode : switch the content between div content editable and textarea
	*/
	switchCode() {
		this.codeIsShow = !this.codeIsShow;

		// buttons
		let codeBtn = this.toolbar.getElementsByClassName("EVA_CodeEditor_tbPart")[0];
		let lsTbPart = this.toolbar.childNodes;
		lsTbPart.forEach(e => {
			if (e !== codeBtn) {
				if (this.inCodeMode()) e.style.display = "none";
				else e.style.display = "flex";
			}
		});

		// line number + bottom toolbar
		let display = this.inCodeMode() ? "block" : "none";
		this.lineNumber.style.display = display;
        this.bottomToolbar.style.display = display;

		// content editable style
		if (this.inCodeMode()) {
			this.contentEditable.classList.remove("EVA_CodeEditor_contenteditableHtml");
			this.contentEditable.classList.add("EVA_CodeEditor_contenteditableCode");
		}
		else {
			this.contentEditable.classList.remove("EVA_CodeEditor_contenteditableCode");
			this.contentEditable.classList.add("EVA_CodeEditor_contenteditableHtml");
		}

		if (this.inCodeMode()) {
			this.contentEditable.innerText = this.parser();
			this.updateNumRow();
			this.beautify();
		}
		else {
			this.contentEditable.innerHTML = this.textarea.value;
		}

		this.contentEditable.focus();
		this.rezise();
	}

	/**
		display : show if btns is selected
	*/
	display() {
		if (this.inCodeMode()) return;

		let selectClass = " EVA_CodeEditor_selected";
		let btnList = [
			"bold",
			"underline",
			"italic",
			"subscript",
			"superscript",
			"justifyLeft",
			"justifyCenter",
			"justifyRight",
			"justifyFull",
			"strikeThrough",
			"insertOrderedList",
			"insertUnorderedList"
		];
		
		btnList.forEach(btnName => {
			let elm = this.toolbar.querySelector(".EVA_CodeEditor_" + btnName);
			if (elm !== null) {
				elm.className = elm.className.replace(selectClass, '');
				if (document.queryCommandState(btnName)) {
					elm.className = elm.className + selectClass;
				}
			}
		});
	}

	/**
		edit : exec command select by user
		command : command select by user 
	*/
	edit(command) {
		if (this.inCodeMode()) return;

		let focusDivContentEditable = () => {
			// get focus
			let selObj = window.getSelection();
			if (selObj.rangeCount) {
				// get div contentEditable selected
				let elm = selObj.getRangeAt(0).startContainer;
				let state;
				while (true) {
					if (elm == this.contentEditable) {
						state = "find";
						break;
					}
					else if (elm.nodeName == "BODY") {
						break;
					}

					elm = elm.parentElement;
				}

				if (state !== "find") {
					this.contentEditable.focus();
					this.display();
					return false;
				}
				else {
					return true;
				}
			}
			else {
				this.contentEditable.focus();
				this.display();
				return false;
			}
		}

		if (focusDivContentEditable()) {

			let end = () => {
				this.save();
				this.contentEditable.focus();
				this.display();
			}

			// select good paramaters
			if (command == 'formatBlock') {
				let elem = this.toolbar.querySelector("[name=title]");
				if (elem) {
					document.execCommand(command, false, elem.value);
					if (elem == "pre") {
						let str = this.contentEditable.innerHTML;
						str = str.replace('<pre>', '');
						str = str.replace('</pre>', '');
						this.contentEditable.innerHTML = str;
					}
	
					end();
				}
			}
			else if (command == 'fontName') {
				let elm = this.toolbar.querySelector("[name=font]");
				if (elm) {
					document.execCommand(command, false, elm.value);
				}
				
				end();
			}
			else if (command == 'fontSize') {
				let elm = this.toolbar.querySelector("[name=fontSize]");
				if (elm) {
					document.execCommand(command, false, elm.value);
				}

				end();
			}
			else if (command == "insertImage" || command == "createLink") {
				confCommand = {
					command: command,
					end: end,
					myThis: this
				};

				popupImgLink.show();
			}
			else if (command == "foreColor" || command == "hiliteColor") {
				confCommand = {
					command: command,
					end: end,
					myThis: this
				};

				popupColorBtn.show();
			}
			else if (command == "paste") {
				/////////////////////////////////////////////////////////////////////////////// don't work on firefox and on server maybe
				// paste
				navigator.clipboard.read().then(clip => {
					if (clip[0].types.includes("image/png")) {
						clip[0].getType("image/png")
						.then(images => {
							let reader  = new FileReader();
						
							reader.addEventListener("load", function () {
								link = reader.result;

								document.execCommand("insertImage", false, link);
							}, false);
						
							reader.readAsDataURL(images);
						})
						.catch(err => {
							console.log(err)
						});
					}
					else if (clip[0].types.includes("text/html")) {
						clip[0].getType("text/html")
						.then(blob => {
							return blob.text();
						})
						.then(code => {
							document.execCommand("insertHTML", false, code);
						})
						.catch(err => {
							console.log(err)
						});
					}
					else if (clip[0].types.includes("text/plain")) {
						clip[0].getType("text/html")
						.then(blob => {
							return blob.text();
						})
						.then(code => {
							document.execCommand("insertText", false, code);
						})
						.catch(err => {
							console.log(err)
						});
					}
				});
			}
			else {
				document.execCommand(command, false, null);

				end();
			}
		}
	}
}

// init module
window.addEventListener("load", () => {
	document.execCommand("styleWithCSS", false, null);

	let lsClass = Object.keys(conf.lsClass);
	lsClass.forEach((aClass) => {
		let lsTextarea = document.querySelectorAll(`.${aClass} textarea, textarea.${aClass}`);
		lsTextarea.forEach(textarea => {
			let newEditor = conf.lsClass[aClass].toolbar ? new Wysiwyg(textarea, aClass) : new CodeEditor(textarea, aClass);
			newEditor.rezise();
		});
	});

	// create popups
	initMask();
	popupImgLink.init();
	popupColorBtn.init();
	popupImgLinkInfo.init();
	resizeableDiv.init();
});

// wisiwig popup
let initMask = () => {
	// create mask
	let mask = document.createElement("div");
	mask.id = "EVA_CodeEditor_popupMask";
	mask.style.display = "none";

	// event
	mask.addEventListener("click", () => {
		hidePopup();
		confCommand.myThis.contentEditable.focus();
	});

	// add mask into document
	document.body.appendChild(mask);
}

let hidePopup = () => {
	let lsId = ["EVA_CodeEditor_popupImgLinkBtn", "EVA_CodeEditor_popupColorBtn", "EVA_CodeEditor_resizeableDiv", "EVA_CodeEditor_popupMask"];
	lsId.forEach(id => {
		document.getElementById(id).style.display = "none";
	});
	
	popupImgLinkInfo.hide();
}

let popupImgLink = {}
popupImgLink.init = () => {
	// get popup
	let template = document.getElementById("EVA_CodeEditor_template");
	let popup = document.importNode(template.content, true).getElementById("EVA_CodeEditor_popupImgLinkBtn");
	popup.style.display = "none";

	// set language
	let linkLanguage = conf.popupDef.linkBtn;
	// text
	let content = linkLanguage.text.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.text.content;
	}
	popup.querySelector(".EVA_CodeEditor_text").placeholder = content;
	// link
	content = linkLanguage.link.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.link.content;
	}
	popup.querySelector(".EVA_CodeEditor_link").placeholder = content;
	// embedded image
	content = linkLanguage.embeddedImage.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.embeddedImage.content;
	}
	popup.querySelector(".EVA_CodeEditor_embeddedImage label").textContent = content;
	// target
	content = linkLanguage.target.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.target.content;
	}
	popup.querySelector(".EVA_CodeEditor_target label").textContent = content;
	// title
	content = linkLanguage.title.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.title.content;
	}
	popup.querySelector(".EVA_CodeEditor_title").placeholder = content;
	// validate
	content = linkLanguage.validate.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.validate.content;
	}
	popup.querySelector(".EVA_CodeEditor_validate").textContent = content;

	const validate = () => {
		// verif value
		let text = popup.querySelector(".EVA_CodeEditor_text");
		let link = popup.querySelector(".EVA_CodeEditor_link");
		if (text.style.display == "block" && text.value == "") {
			// err
			text.focus();
		}
		else if (link.value == "") {
			// err
			link.focus();
		}
		else {
			// create observer
			let title = popup.querySelector(".EVA_CodeEditor_title");
			const observer = new MutationObserver((lsMutation) => {
				lsMutation.forEach(mutation => {
					mutation.addedNodes.forEach(nodeAdded => {
						if (nodeAdded.nodeName == 'A' || nodeAdded.nodeName == 'IMG') {
							observer.disconnect();

							// add title
							if (title.value !== "") {
								nodeAdded.title = title.value;
							}

							// add target
							if (confCommand.command == "createLink" && popup.querySelector(".EVA_CodeEditor_target input").checked) {
								nodeAdded.target = "_blank";
							}

							confCommand.end();
						}
					});
				});
			});
			observer.observe(confCommand.myThis.contentEditable, { subtree: true, childList: true });

			// hide popup
			hidePopup();

			// set selection
			let selObj = window.getSelection();
			let range = document.createRange();
			range.setStart(selRange.startContainer, selRange.startOffset);
			range.setEnd(selRange.endContainer, selRange.endOffset);
			
			if (text.style.display == "block") {
				// insert text in range
				let a = document.createElement("a");
				a.innerText = text.value;
				a.href = link.value;
				range.insertNode(a);
			}
			else {
				document.execCommand(confCommand.command, false, link.value);
			}

			selObj.removeAllRanges();
			selObj.addRange(range);
			
			// else
			if (text.style.display !== "block") {
				// do command
				let checkBox = popup.querySelector(".EVA_CodeEditor_embeddedImage input");
				if (checkBox.checked) {
					// dl image
					fetch(link.value, {mode: 'no-cors'})
					.then(response => response.blob())
					.then(images => {
						
						let reader  = new FileReader();
					
						reader.addEventListener("load", function () {
							link = reader.result;

							document.execCommand(confCommand.command, false, link);
							confCommand.end();
						}, false);
					
						reader.readAsDataURL(images);
					})
					.catch(err => {
						console.log(err)
					});
				}
				else {
					link = link.value;
					document.execCommand(confCommand.command, false, link);
					confCommand.end();
				}
			}
			else {
				confCommand.end();
			}
		}
	}

	popup.addEventListener("keyup", (e) => {
		if (e.key == "Enter" && popup.getElementsByTagName("textarea")[0] !== document.activeElement) {
			validate();
			e.preventDefault();
		}
		else if (e.key == "Escape") {
			hidePopup();
			confCommand.myThis.contentEditable.focus();
			e.preventDefault();
		}
	});
	popup.querySelector(".EVA_CodeEditor_validate").addEventListener("click", () => {
		validate();
	});

	// add popup into document
	document.body.appendChild(popup);
}
popupImgLink.show = () => {
	let popup = document.querySelector("#EVA_CodeEditor_popupImgLinkBtn");
	let selObj = window.getSelection();
	selRange = selObj.getRangeAt(0);

	// show mask
	document.querySelector("#EVA_CodeEditor_popupMask").style.display = "block";

	// hide or show some parts
	// text
	if (selRange.collapsed && confCommand.command == "createLink") {
		popup.querySelector(".EVA_CodeEditor_text").value = "";
		popup.querySelector(".EVA_CodeEditor_text").style.display = "block";
	}
	else {
		popup.querySelector(".EVA_CodeEditor_text").style.display = "none";
	}
	// link
	popup.querySelector(".EVA_CodeEditor_link").value = "";
	// check box
	if (confCommand.command == "createLink") {
		popup.querySelector(".EVA_CodeEditor_embeddedImage").style.display = "none";
		popup.querySelector(".EVA_CodeEditor_target").style.display = "inline";
	}
	else {
		popup.querySelector(".EVA_CodeEditor_embeddedImage").style.display = "inline";
		popup.querySelector(".EVA_CodeEditor_target").style.display = "none";
	}
	// title
	popup.querySelector(".EVA_CodeEditor_title").value = "";

	// place popup
	let pos = confCommand.myThis.toolbar.querySelector(".EVA_CodeEditor_" + confCommand.command).getBoundingClientRect();
	popup.style.top = pos.y + pos.height + window.scrollY + "px";
	popup.style.left = pos.x + window.scrollX + "px";

	// show popup
	popup.style.display = "grid";

	// set focus in first input
	let lsInput = popup.querySelectorAll("input");
	for (let i = lsInput.length - 1; i >= 0; i--) {
		if (lsInput[i].style.display !== "none") {
			lsInput[i].focus();
		}
	}
}

let popupColorBtn = {}
popupColorBtn.init = () => {
	// get popup
	let template = document.querySelector("#EVA_CodeEditor_template");
	let popup = document.importNode(template.content, true).querySelector("#EVA_CodeEditor_popupColorBtn");
	popup.style.display = "none";

	// fill default div
	conf.popupDef.color.default.forEach(colorConf => {
		// create btn
		let btn = document.createElement("button");
		btn.style.background = colorConf.color;
		btn.title = colorConf.title[conf.language];
		// onclick
		btn.addEventListener("click", () => {
			hidePopup();
			confCommand.myThis.contentEditable.focus();

			document.execCommand(confCommand.command, false, colorConf.color);
		});

		// add btn
		popup.querySelector(".EVA_CodeEditor_default").appendChild(btn);
	});
	// fill noColor btn
	let title = conf.popupDef.color.noColor;
	let content = title.contentLanguage[conf.language];
	if (content == undefined) {
		content = title.content;
	}
	popup.querySelector(".EVA_CodeEditor_transparent").innerHTML = content;
	popup.querySelector(".EVA_CodeEditor_transparent").addEventListener("click", () => {
		hidePopup();
		confCommand.myThis.contentEditable.focus();

		document.execCommand(confCommand.command, false, "rgba(0, 0, 0, 0)");
	});

	// add popup into document
	document.body.appendChild(popup);
}
popupColorBtn.show = () => {
	let popup = document.querySelector("#EVA_CodeEditor_popupColorBtn");
	let selObj = window.getSelection();
	selRange = selObj.getRangeAt(0);

	// hide or show some parts
	// btn transparent
	if (confCommand.command == "hiliteColor") {
		popup.querySelector(".EVA_CodeEditor_transparent").style.display = "block";
	}
	else {
		popup.querySelector(".EVA_CodeEditor_transparent").style.display = "none";
	}

	// place popup
	let pos = confCommand.myThis.toolbar.querySelector(".EVA_CodeEditor_" + confCommand.command).getBoundingClientRect();
	popup.style.top = pos.y + pos.height + window.scrollY + "px";
	popup.style.left = pos.x + window.scrollX + "px";

	// show popup
	document.querySelector("#EVA_CodeEditor_popupMask").style.display = "block";
	popup.style.display = "grid";

	// set focus
	popup.focus();
}

let popupImgLinkInfo = {}
popupImgLinkInfo.init = () => {
	// get popup
	let template = document.querySelector("#EVA_CodeEditor_template");
	let popup = document.importNode(template.content, true).querySelector("#EVA_CodeEditor_popupImgLinkInfo");
	popup.style.display = "none";

	// esc and enter
	const validate = () => {
		// update link
		let inputList = popup.querySelectorAll("input, textarea");
		if (inputList[0].value == "") {
			inputList[0].focus();
		}
		else {
			elmClicked.href = inputList[0].value;
			if (inputList[1].value !== "") {
				elmClicked.title = inputList[1].value;
			}
			else {
				elmClicked.removeAttribute("title");
			}
			confCommand.myThis.save();

			hidePopup();
			confCommand.myThis.contentEditable.focus();
		}
	}
	popup.addEventListener("keyup", (e) => {
		if (e.key == "Enter" && popup.getElementsByTagName("textarea")[0] !== document.activeElement) {
			validate();
			e.preventDefault();
		}
		else if (e.key == "Escape") {
			hidePopup();
			confCommand.myThis.contentEditable.focus();
			e.preventDefault();
		}
	});

	// set language
	let linkLanguage = conf.popupDef.linkInfo;
	// copy
	let content = linkLanguage.copy.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.copy.content;
	}
	popup.querySelectorAll("button")[0].title = content;
	// edit
	content = linkLanguage.edit.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.edit.content;
	}
	popup.querySelectorAll("button")[1].title = content;
	// unlink
	content = linkLanguage.unlink.contentLanguage[conf.language];
	if (content == undefined) {
		content = linkLanguage.unlink.content;
	}
	popup.querySelectorAll("button")[2].title = content;

	// btns events
	let btnList = popup.querySelectorAll("button");
	// copy
	btnList[0].addEventListener("click", () => {
		let input = document.createElement("input");
		input.id = "EVA_CodeEditor_temp";
		input.value = elmClicked.href;

		document.body.appendChild(input);
		input.select();

		document.execCommand("copy");

		input.remove();
	});
	// edit
	btnList[1].addEventListener("click", () => {
		// hide 3 btns
		popup.querySelectorAll(".EVA_CodeEditor_popupImgLinkInfo_opt button").forEach(elm => {
			elm.style.display = "none";
		});

		let div = popup.querySelector(".EVA_CodeEditor_popupImgLinkInfo_edit");

		// fill input
		// set language
		let linkLanguage = conf.popupDef.linkEdit;
		// link
		content = linkLanguage.link.contentLanguage[conf.language];
		if (content == undefined) {
			content = linkLanguage.link.content;
		}
		div.querySelector("input").placeholder = content;
		// title
		content = linkLanguage.title.contentLanguage[conf.language];
		if (content == undefined) {
			content = linkLanguage.title.content;
		}
		div.querySelector("textarea").placeholder = content;
		// validate
		content = linkLanguage.validate.contentLanguage[conf.language];
		if (content == undefined) {
			content = linkLanguage.validate.content;
		}
		div.querySelector("button").textContent = content;

		div.querySelector("input").value = elmClicked.href;
		div.querySelector("textarea").value = elmClicked.title;

		// event
		div.querySelector("button").addEventListener("click", () => {
			validate();
		})

		// hide or show some parts
		popup.querySelector(".EVA_CodeEditor_popupImgLinkInfo_opt").style.display = "none";
		popup.querySelector(".EVA_CodeEditor_popupImgLinkInfo_edit").style.display = "flex";

		div.querySelector("input").select();
	});
	// unlink
	btnList[2].addEventListener("click", () => {
		hidePopup();

		confCommand.myThis.contentEditable.focus();

		elmClicked.remove();

		confCommand.myThis.save();
		confCommand.myThis.display();
	});

	// add popup into document
	document.body.appendChild(popup);
}
popupImgLinkInfo.show = () => {
	let popup = document.querySelector("#EVA_CodeEditor_popupImgLinkInfo");
	let selObj = window.getSelection();
	selRange = selObj.getRangeAt(0);

	// fill popup with info
	popup.querySelector("a").href = elmClicked.href;
	popup.querySelector("a").textContent = elmClicked.href;

	// hide or show some parts
	popup.querySelector(".EVA_CodeEditor_popupImgLinkInfo_opt").style.display = "flex";
	popup.querySelector(".EVA_CodeEditor_popupImgLinkInfo_edit").style.display = "none";

	// place popup
	let pos = elmClicked.getBoundingClientRect();
	popup.style.top = pos.bottom + window.scrollY + "px";
	popup.style.left = pos.x + window.scrollX + "px";

	// show popup
	document.querySelector("#EVA_CodeEditor_popupMask").style.display = "block";
	popup.style.display = "flex";

	// set focus
	popup.focus();
}
popupImgLinkInfo.hide = () => {
	let popup = document.querySelector("#EVA_CodeEditor_popupImgLinkInfo");
	// show 3 btns
	popup.querySelectorAll("button").forEach(elm => {
		elm.style.display = "block";
	});
	// retrive a element
	if (popup.querySelector("div")) {
		let a = document.createElement("a");
		a.target = "_blank";
	}

	popup.style.display = "none";
}

let resizeableDiv = {}
resizeableDiv.init = () => {
	// create resizeable div
	let template = document.getElementById("EVA_CodeEditor_template");
	let div =  document.importNode(template.content, true).getElementById("EVA_CodeEditor_resizeableDiv");

	// set event
	let currentHand;
	let lsHand = div.getElementsByTagName("div");
	for (let i = 0; i < lsHand.length; i++) {
		let hand = lsHand[i];
		let aspectRation;
		hand.addEventListener("mousedown", () => {
			currentHand = hand;
			aspectRation = div.style.width.split("px")[0] * 1 / div.style.height.split("px")[0] * 1;
		});
		window.addEventListener("mousemove", (evt) => {
			if (currentHand == hand) {
				// resize div resizeable
				let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
				let scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
				if (i == 0) {
					// horizontaly hand
					div.style.width = evt.clientX - div.offsetLeft + scrollLeft + "px";
				}
				else if (i == 1) {
					// verticaly hand
					div.style.height = evt.clientY - div.offsetTop + scrollTop + "px";
				}
				else {
					// proportionaly hand
					let divResizeablePos = div.getBoundingClientRect();
					let x = evt.clientX - divResizeablePos.left;
					let y = evt.clientY - divResizeablePos.top;

					let newWidth;
					let newHeight;
					if (div.style.height.split("px")[0] * 1 - y > div.style.width.split("px")[0] * 1 - x) {
						newWidth = x;
						newHeight = newWidth / aspectRation;
					}
					else {
						newHeight = y;
						newWidth = newHeight * aspectRation;
					}

					div.style.width = newWidth + "px";
					div.style.height = newHeight + "px";
				}
			}
		});
		window.addEventListener("mouseup", () => {
			if (currentHand) {
				// resize image like resizeable div
				elmClicked.style.height = div.style.height;
				elmClicked.style.width = div.style.width;
		
				confCommand.myThis.save();
				resizeableDiv.show();
				// popupImgLinkInfo.show();

				currentHand = undefined;
			}
		});
	}

	// add popup into document
	div.style.display = "none";
	document.body.appendChild(div);
}
resizeableDiv.show = () => {
	let div = document.querySelector("#EVA_CodeEditor_resizeableDiv");

	// cover image with resizeableDiv
	let pos = elmClicked.getBoundingClientRect();
	
	div.style.top = pos.y + window.scrollY - 1 + "px";
	div.style.left = pos.x + window.scrollX - 1 + "px";
	div.style.height = pos.height + "px";
	div.style.width = pos.width + "px";

	// show resizeableDiv
	document.querySelector("#EVA_CodeEditor_popupMask").style.display = "block";
	div.style.display = "block";

	// set focus
	div.focus();
}