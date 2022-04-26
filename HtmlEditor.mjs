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

// include
import conf from './HtmlEditorConfig.mjs';

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

let minify = (code, lang) => {
	if (lang == "html") {

	}

	return code;
	// // trim row if we aren't in string

	// let counter = (i, j) => {
	// 	let counter = 0;
	// 	let k = 1;
	// 	while (true) {
	// 		if (rows[i][j - k] == "\\") {
	// 			counter++;
	// 			k++;
	// 		}
	// 		else {
	// 			break;
	// 		}
	// 	}

	// 	return counter % 2 == 0;
	// }

	// let rows = code.trim()
	// .replaceAll(/\n\n(\n)+/g, "\n\n")
	// .split('\n');
	// let strIdentifier = "";
	// let inComment = false;
	
	// for (let i = 0; i < rows.length; i++) {
	// 	for (let j = 0; j < rows[i].length; j++) {
	// 		// in comment
	// 		if (inComment) {
	// 			if (rows[i][j] == "*" && rows[i][j + 1] == "/") {
	// 				inComment = false;
	// 				j++;
	// 			}
	// 		}

	// 		// in string
	// 		else if (strIdentifier !== "") {
	// 			if (counter(i, j) && rows[i][j] == strIdentifier) {
	// 				strIdentifier = "";
	// 			}
	// 		}

	// 		// out
	// 		else {
	// 			if (j == 0) {
	// 				rows[i] = rows[i].trimStart();
	// 			}

	// 			// enter in string
	// 			if (rows[i][j] == "'" || rows[i][j] == "\"" || rows[i][j] == "`" && rows[i][j - 1] !== "\\") {
	// 				if (counter(i, j)) {
	// 					strIdentifier = rows[i][j];
	// 				}
	// 			}
	// 			// enter in comment
	// 			else if (rows[i][j] == "/") {
	// 				// comment //
	// 				if (rows[i][j + 1] == "/") {
	// 					// go to next line
	// 					rows[i] = rows[i].trimEnd();
	// 					break;
	// 				}
	// 				// comment /*/
	// 				else if (rows[i][j + 1] == "*") {
	// 					inComment = true;
	// 					j++;
	// 				}
	// 				// regex
	// 				else {
	// 					let match = rows[i].substring(j, rows[i].length).match(this.conf.syntaxColor.var[3].regex);
	// 					if (match) {
	// 						let regexLength = match[0].length;
	// 						j += regexLength;
	// 					}
	// 				}
	// 			}

	// 			if (j == rows[i].length - 1) {
	// 				rows[i] = rows[i].trimEnd();
	// 			}
	// 		}
	// 	}
	// }

	// return rows.join("\n");
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
		this.contentEditable.style.height = this.textarea.offsetHeight + "px";
		this.contentEditable.style.width = this.textarea.offsetWidth + "px";

		this.bottomToolbar = this.wrap.querySelector(".EVA_CodeEditor_wrap > div:last-child");
		
		this.contentEditable.innerText = this.textarea.innerHTML;
		this.contentEditable.className = "EVA_CodeEditor_contenteditableCode";

		this.textarea.style.display = "none";
		this.textarea.insertAdjacentElement("beforebegin", this.wrap);

		this.beautify();
		this.syntaxHighlighter();
		this.updateNumRow();

		// set event
		// action make once after inactivity
		this.timoutId;
		this.timout = () => {
			clearTimeout(this.timoutId);
			this.timoutId = setTimeout(() => {
				if (this.inCodeMode()) {
					this.updateNumRow();
					this.syntaxHighlighter();
				}
				else {
					this.display();
				}
				this.save();
			}, 1000);
		}
		this.contentEditable.addEventListener("input", this.timout);

		this.contentEditable.addEventListener("focus", () => {
			document.execCommand("defaultParagraphSeparator", false, this.inCodeMode() ? "div" : "p");
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
		this.contentEditable.addEventListener("keydown", evt => {
			this.timout();

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
				let lineSpan = document.createElement("span");
				let contentSpan = document.createElement("span");
				contentSpan.innerText = "";

				// increase indent level ?
				if (container.innerText.split("").reverse()[0] == "{") indentLevel++;

				// indent
				for (let i = 0; i < indentLevel; i++) {
					contentSpan.innerText += '\t';
				}
				contentSpan.innerText += text;
	
				lineSpan.appendChild(contentSpan);
				newLine.appendChild(lineSpan);
				container.insertAdjacentElement("afterend", newLine);

				setCursorOffset(contentSpan, indentLevel);
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

	inCodeMode() {
		return (!(this instanceof Wysiwyg) || this.codeIsShow);
	}

	rezise() {
		// width
		this.wrap.style.width = this.contentEditable.style.width.split("px")[0] * 1 + this.lineNumber.offsetWidth + 4 + "px";
		// height
		this.wrap.style.height = (this instanceof Wysiwyg ? this.toolbar.offsetHeight : 0) + this.contentEditable.style.height.split("px")[0] * 1 + this.bottomToolbar.offsetHeight + 4 + "px";

		this.lineNumber.style.height = this.contentEditable.style.height;
	}

	getTopDiv(element) {
		if (!this.inCodeMode()) return;

		while (element !== this.contentEditable) {
			if (element.nodeName == "DIV" && element.parentElement == this.contentEditable) {
				return element;
			}
			else {
				element = element.parentElement;
	
				if (element.nodeName == 'BODY') {
					return;
				}
			}
		}
	
		return element.firstChild;
	}

	save() {
		if (!this.inCodeMode()) return;
		
		this.textarea.value = minify(this.contentEditable.innerText, this.getCodeLang());
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
			let lineSpan = document.createElement("span");
			let contentSpan = document.createElement("span");
			contentSpan.innerText = this.contentEditable.innerText;
			lineSpan.appendChild(contentSpan);
			newLine.appendChild(lineSpan);
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

		let lsDiv = this.contentEditable.getElementsByTagName("div");
		let code = [];
		for (let i = 0; i < lsDiv.length; i++) {
			code.push(lsDiv[i].innerText);
		}
		code = code.join("\n");

		return code;
	}

	setCode(code) {
		if (!this.inCodeMode()) return;

		let lsLine = code.split("\n");
		this.contentEditable.innerHTML = "";
		lsLine.forEach(line => {
			let newLine = document.createElement("div");
			let lineSpan = document.createElement("span");
			let contentSpan = document.createElement("span");

			contentSpan.innerText = line;

			lineSpan.appendChild(contentSpan);
			newLine.appendChild(lineSpan);
			this.contentEditable.appendChild(newLine);
		});

		this.updateNumRow();
	}

	getCodeLang() {
		return (this.conf.codeLanguage || conf.lsClass[this.conf.code].codeLanguage);
	}

	/**
		beautify : code indented + code colored
	*/
	beautify() {
		if (!this.inCodeMode()) return;

		// indent code
		let lang = this.getCodeLang();
		let code = this.textarea.value;

		if (lang == "html") {
			// let process = (str) => {
			// 	var div = document.createElement('div');
			// 	div.innerHTML = str.trim();
			
			// 	return format(div, 0).innerHTML;
			// }
			// let format = (node, level) => {
			// 	var indentBefore = new Array(level++ + 1).join('\t'),
			// 	indentAfter = new Array(level - 1).join('\t'),
			// 	textNode;
			
			// 	for (var i = 0; i < node.children.length; i++) {
			// 		textNode = document.createTextNode('\n' + indentBefore);
			// 		node.insertBefore(textNode, node.children[i]);
				
			// 		format(node.children[i], level);
				
			// 		if (node.lastElementChild == node.children[i]) {
			// 			textNode = document.createTextNode('\n' + indentAfter);
			// 			node.appendChild(textNode);
			// 		}
			// 	}
			
			// 	return node;
			// }

			// code = process(code);

			code = code.replaceAll('>', '>\n');
			code = code.replaceAll('<', '\n<');
			code = code.replaceAll('>\n\n<', '>\n<');

			// remove \n at index 0 and last index if exist
			if (code[0] == "\n") {
				code = code.slice(1, code.length);
			}
			if (code[code.lenght - 1] == "\n") {
				code = code.slice(0, code.length - 1);
			}

			code = code.split("\n");

			let lsBaliseToIndent = conf.lsCodeLanguage.html.lsBlockToIndent;

			lsBaliseToIndent.forEach(el => {
				let baliseOpen = [];
				for (let i = 0; i < code.length; i++) {
					if (code[i].trimStart()[0] == "<" && code[i][code[i].length - 1] == ">") {
						let balise = code[i].trimStart().slice(1, code[i].trimStart().length - 1);
						balise = balise.split(" ")[0];
						
						if (balise == "/" + el) {
							// add indent
							let temp = baliseOpen.splice(baliseOpen.length - 1, 1)[0] + 1;
							for (let i1 = temp; i1 < i; i1++) {
								code[i1] = "\t" + code[i1];
							}
						}
						else if (balise == el) {
							baliseOpen.push(i);
						}
					}
				}
			});

			code = code.join("\n");
		}

		this.setCode(code);

		this.syntaxHighlighter();
	}

	syntaxHighlighter() {
		if (!this.inCodeMode()) return;

	}
}

class Wysiwyg extends CodeEditor {
	constructor(textarea, type) {
		super(textarea, type);

		this.contentEditable.className = "EVA_CodeEditor_contenteditableHtml";

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
				if (evt.key == "s") {
					this.edit("underline");
					evt.preventDefault();
				}
				else if (e.key == "g") {
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
				popupLinkInfo.show();
				confCommand.myThis = this;
			}
			else if (elmClicked.nodeName == "IMG") {
				resizeableDiv.show();
				confCommand.myThis = this;
			}
		});
	}

	/**
		save : copy div contentEditable content in textarea
	*/
	save() {
		if (this.inCodeMode()) super.save();
		else this.textarea.value = this.contentEditable.innerHTML;
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
		this.contentEditable.className = this.inCodeMode() ? "EVA_CodeEditor_contenteditableCode" : "EVA_CodeEditor_contenteditableHtml";

		if (this.inCodeMode()) {
			this.contentEditable.innerText = this.textarea.value;
			this.updateNumRow();
			this.beautify();
		}
		else {
			this.contentEditable.innerHTML = this.textarea.value;
		}

		// this.contentEditable.focus();
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
	popupLinkInfo.init();
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
	
	popupLinkInfo.hide();
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
		if (e.key == "Enter") {
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

let popupLinkInfo = {}
popupLinkInfo.init = () => {
	// get popup
	let template = document.querySelector("#EVA_CodeEditor_template");
	let popup = document.importNode(template.content, true).querySelector("#EVA_CodeEditor_popupLinkInfo");
	popup.style.display = "none";

	// esc and enter
	const validate = () => {
		// update link
		let inputList = popup.querySelectorAll("input");
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
		if (e.key == "Enter") {
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
		popup.querySelectorAll(".EVA_CodeEditor_popupLinkInfo_opt button").forEach(elm => {
			elm.style.display = "none";
		});

		let div = popup.querySelector(".EVA_CodeEditor_popupLinkInfo_edit");

		// fill input
		// set language
		let linkLanguage = conf.popupDef.linkEdit;
		// link
		content = linkLanguage.link.contentLanguage[conf.language];
		if (content == undefined) {
			content = linkLanguage.link.content;
		}
		div.querySelectorAll("input")[0].placeholder = content;
		// title
		content = linkLanguage.title.contentLanguage[conf.language];
		if (content == undefined) {
			content = linkLanguage.title.content;
		}
		div.querySelectorAll("input")[1].placeholder = content;
		// validate
		content = linkLanguage.validate.contentLanguage[conf.language];
		if (content == undefined) {
			content = linkLanguage.validate.content;
		}
		div.querySelector("button").textContent = content;

		div.querySelectorAll("input")[0].value = elmClicked.href;
		div.querySelectorAll("input")[1].value = elmClicked.title;

		// event
		div.querySelector("button").addEventListener("click", () => {
			validate();
		})

		// hide or show some parts
		popup.querySelector(".EVA_CodeEditor_popupLinkInfo_opt").style.display = "none";
		popup.querySelector(".EVA_CodeEditor_popupLinkInfo_edit").style.display = "flex";

		div.querySelectorAll("input")[0].select();
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
popupLinkInfo.show = () => {
	let popup = document.querySelector("#EVA_CodeEditor_popupLinkInfo");
	let selObj = window.getSelection();
	selRange = selObj.getRangeAt(0);

	// fill popup with info
	popup.querySelector("a").href = elmClicked.href;
	popup.querySelector("a").textContent = elmClicked.href;

	// hide or show some parts
	popup.querySelector(".EVA_CodeEditor_popupLinkInfo_opt").style.display = "flex";
	popup.querySelector(".EVA_CodeEditor_popupLinkInfo_edit").style.display = "none";

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
popupLinkInfo.hide = () => {
	let popup = document.querySelector("#EVA_CodeEditor_popupLinkInfo");
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
	let div = document.createElement("div");
	div.id = "EVA_CodeEditor_resizeableDiv";

	// set event
	let mouseIsup = true;
	div.addEventListener("mousedown", () => {
		mouseIsup = false;
	});
	div.addEventListener("mousemove", (evt) => {
		if (mouseIsup == false) {
			// resize image like resizeable div
			elmClicked.style.height = div.style.height;
			elmClicked.style.width = div.style.width;

			confCommand.myThis.save();
		}
	});
	div.addEventListener("mouseup", () => {
		mouseIsup = true;
	});

	// add popup into document
	document.body.appendChild(div);
}
resizeableDiv.show = () => {
	let div = document.querySelector("#EVA_CodeEditor_resizeableDiv");

	// cover image with resizeableDiv
	let pos = elmClicked.getBoundingClientRect();
	div.style.top = pos.y + window.scrollY + "px";
	div.style.left = pos.x + window.scrollY + "px";
	div.style.height = pos.bottom - pos.y + "px";
	div.style.width = pos.right - pos.x + "px";

	// show resizeableDiv
	document.querySelector("#EVA_CodeEditor_popupMask").style.display = "block";
	div.style.display = "block";

	// set focus
	div.focus();
}