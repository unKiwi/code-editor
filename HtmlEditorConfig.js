/*********************************************************************
** ---------------------- Copyright notice ---------------------------
** This source code is part of the EVASoft project
** It is property of Alain Boute Ingenierie - www.abing.fr and is
** distributed under the GNU Public Licence version 2
** Commercial use is submited to licencing - contact eva@abing.fr
** -------------------------------------------------------------------
**        File : CodeEditorConfig.mjs
** Description : The config file for the module
**      Author : Luc TORRES
**     Created : Apr 2022
*********************************************************************/
"use strict";

const conf = {
	language: navigator.language.substring(0, 2),
	lsColor: {
		comment: "#6a993e", // green
		string: "#ce915b", // orange
		expSQL: "#C586C0", // pink
		keyWordPrimary: "#569cb3", // blue
		keyWordSecondary: "#c586b6", // purple
	},
	lsCodeLanguage: {
		html: {
			// demo: [
			// 	{name: "head", start: "<head", end: "</head", indent: true, explode: true, minify: true, color: "comment"},
			// ],
			lsBlockToParse: ["blockquote", "div", "ol", "ul", "li", "p", "tr", "td", "tbody", "thead", "table", "body", "head", "style", "pre", "button"],
			lsStrToIndent: [
				{str: "<head", action: "indent"},
				{str: "</head", action: "outdent"},
				{str: "<p", action: "indent"},
				{str: "</p", action: "outdent"},
				{str: "<span", action: "indent"},
				{str: "</span", action: "outdent"},
				{str: "<ul", action: "indent"},
				{str: "</ul", action: "outdent"},
				{str: "<ol", action: "indent"},
				{str: "</ol", action: "outdent"},
				{str: "<li", action: "indent"},
				{str: "</li", action: "outdent"},
				{str: "<div", action: "indent"},
				{str: "</div", action: "outdent"},
				{str: "<button", action: "indent"},
				{str: "</button", action: "outdent"},
				{str: "<table", action: "indent"},
				{str: "</table", action: "outdent"},
				{str: "<thead", action: "indent"},
				{str: "</thead", action: "outdent"},
				{str: "<tbody", action: "indent"},
				{str: "</tbody", action: "outdent"},
				{str: "<th", action: "indent"},
				{str: "</th", action: "outdent"},
				{str: "<tr", action: "indent"},
				{str: "</tr", action: "outdent"},
			],
			lsBlockNoMinify: [
				{start: '<!--', end: '-->', type: "comment"},
				{start: '{{', end: '}}', type: "expSQL"},
				{start: '<pre', end: '</pre>'},
				{start: '<style', end: '</style>'},
				{start: '<script', end: '</script>'},
			],
			syntaxColor: {
				const: [],
			},
		},
		css: {
			lsStrToIndent: [
				{str: "{", action: "indent"},
				{str: "}", action: "outdent"},
			],
			lsBlockNoMinify: [
				{start: '/*', end: '*/', type: "comment"},
				{start: '{{', end: '}}', type: "expSQL"},
			],
			syntaxColor: {
				const: [],
			},
		},//*
		js: {
			lsStrToIndent: [
				{str: "{", action: "indent"},
				{str: "}", action: "outdent"},

				{str: "[", action: "indent"},
				{str: "]", action: "outdent"},

				{str: "(", action: "indent"},
				{str: ")", action: "outdent"},
			],
			lsBlockNoMinify: [
				{start: '/*', end: '*/', type: "comment"},
				{start: '//', end: '\n', type: "comment"},
				{start: '\'', end: '\'', escape: "\\", type: "string"},
				{start: '"', end: '"', escape: "\\", type: "string"},
				{start: '`', end: '`', escape: "\\", type: "string"},
				{start: '{{', end: '}}', type: "expSQL"},
			],
			syntaxColor: {
				const: [
					{
						lsWord: ["var", "let", "const", "function", "class", "this", "=>", "typeof", "false", "true", "null", "undefined", "new", "style", "Infinity"],
						color: "keyWordPrimary",
					},
					{
						lsWord: ["if", "else", "return", "break", "for", "while", "try", "catch"],
						color: "keyWordSecondary",
					},
				],
			},
		},
		sql: {
			lsStrToIndent: [
				{str: "(", action: "indent"},
				{str: ")", action: "outdent"},
				// {str: "SELECT", action: "indent"},
				// {str: "CREATE", action: "indent"},
				// {str: "INSERT", action: "indent"},
				// {str: "UPDATE", action: "indent"},
				// {str: "DELETE", action: "indent"},
				// {str: ";", action: "outdent"},
			],
			lsBlockNoMinify: [
				{start: '--', end: '\n', type: "comment"},
				{start: '#', end: '\n', type: "comment"},
				{start: '[', end: ']', type: "expSQL"},
			],
			syntaxColor: {
				const: [
					{
						lsWord: ["SELECT", "CREATE", "DROP", "DELETE", "UPDATE", "ALTER", "RENAME", "TRUNCATE", "INSERT", "LOAD"],
						color: "keyWordSecondary",
					},
					{
						lsWord: ["ADD","ALL","AND","ANY","APPLY","AS","ASC","AUTHORIZATION","BACKUP","BEGIN","BETWEEN","BREAK","BROWSE","BULK","BY","CASCADE","CASE","CHECK","CHECKPOINT","CLOSE","CLUSTERED","COALESCE","COLLATE","COLUMN","COMMIT","COMPUTE","CONNECT","CONSTRAINT","CONTAINS","CONTAINSTABLE","CONTINUE","CONVERT","CROSS","CURRENT","CURRENT_DATE","CURRENT_TIME","CURRENT_TIMESTAMP","CURRENT_USER","CURSOR","DATABASE","DBCC","DEALLOCATE","DECLARE","DEFAULT","DENY","DESC","DISK","DISTINCT","DISTRIBUTED","DOUBLE","DUMMY","DUMP","ELSE","END","ERRLVL","ESCAPE","EXCEPT","EXEC","EXECUTE","EXISTS","EXIT","FETCH","FILE","FILLFACTOR","FOLLOWING","FOR","FOREIGN","FREETEXT","FREETEXTTABLE","FROM","FULL","FUNCTION","GOTO","GRANT","GROUP","HAVING","HOLDLOCK","IDENTITY","IDENTITYCOL","IDENTITY_INSERT","IF","IN","INDEX","INNER","INTERSECT","INTO","IS","JOIN","KEY","KILL","LEFT","LIKE","LINENO","MATCH","MATCHED","MERGE","NATURAL","NATIONAL","NOCHECK","NONCLUSTERED","NOCYCLE","NOT","NULL","NULLIF","OF","OFF","OFFSETS","ON","OPEN","OPENDATASOURCE","OPENQUERY","OPENROWSET","OPENXML","OPTION","OR","ORDER","OUTER","OVER","PARTITION","PERCENT","PIVOT","PLAN","PRECEDING","PRECISION","PRIMARY","PRINT","PROC","PROCEDURE","PUBLIC","RAISERROR","READ","READTEXT","RECONFIGURE","REFERENCES","REPLICATION","RESTORE","RESTRICT","RETURN","REVOKE","RIGHT","ROLLBACK","ROWCOUNT","ROWGUIDCOL","ROWS?","RULE","SAVE","SCHEMA","SESSION_USER","SET","SETUSER","SHUTDOWN","SOME","START","STATISTICS","SYSTEM_USER","TABLE","TEXTSIZE","THEN","TO","TOP","TRAN","TRANSACTION","TRIGGER","TSEQUAL","UNBOUNDED","UNION","UNIQUE","UNPIVOT","UPDATETEXT","USE","USER","USING","VALUES","VARYING","VIEW","WAITFOR","WHEN","WHERE","WHILE","WITH","WITHIN","WRITETEXT","XML"],
						color: "keyWordPrimary",
					},
				],
			},
		},
	},
	lsClass: {
		EVA_HtmlEditorSmall: {
			toolbar: {
				lsBtn: [
					["bold", "underline", "italic"],
					["insertOrderedList", "insertUnorderedList"],
				],
			},
			code: "EVA_HtmlCodeEditor",
		},
		EVA_HtmlEditor: {
			toolbar: {
				lsBtn: [
					["code"],
					["undo", "redo"],
					["bold", "underline", "italic"],
					["insertOrderedList", "insertUnorderedList", "createLink", "insertImage"],
					["applyFormat"],
					["font"],
					["outdent", "indent"],
					["removeFormat"],
				],
			},
			code: "EVA_HtmlCodeEditor",
		},
		EVA_HtmlEditorLarge: {
			toolbar: {
				lsBtn: [
					["code"],
					["undo", "redo"],
					["selectAll", /*"paste"*/, "cut", "copy"],
					["applyFormat"],
					["title"],
					["font"],
					["fontSize"],
					["foreColor", "hiliteColor"],
					["bold", "underline", "italic", "subscript", "superscript", "strikeThrough"],
					["insertOrderedList", "insertUnorderedList", "createLink", "insertImage", "insertHorizontalRule"],
					["justifyLeft", "justifyCenter", "justifyRight", "justifyFull"],
					["outdent", "indent"],
					["removeFormat"],
				],
			},
			code: "EVA_HtmlCodeEditor",
		},
		EVA_HtmlCodeEditor: {
			codeLanguage: "html",
		},
		EVA_CssEditor: {
			codeLanguage: "css",
		},
		EVA_JsEditor: {
			codeLanguage: "js",
		},
		EVA_SqlEditor: {
			codeLanguage: "sql",
		},
	},
	btnDef: {
		selectAll: {
			content: "Select all",
			contentLanguage: {
				fr: "Tout selectionner"
			},
			title: {
				en: "Select all",
				fr: "Tout selectionner"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('selectAll');
				}
			}
		},
		insertHorizontalRule: {
			content: "<i class='fas fa-ruler-horizontal'></i>",
			contentLanguage: {},
			title: {
				en: "Horizontal rule",
				fr: "R??gle horizontale"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('insertHorizontalRule');
				}
			}
		},
		foreColor: {
			content: "<i class='fas fa-font'></i>",
			contentLanguage: {},
			title: {
				en: "Text color",
				fr: "Couleur du texte"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('foreColor');
				}
			}
		},
		hiliteColor: {
			content: "<i class='fas fa-highlighter'></i>",
			contentLanguage: {},
			title: {
				en: "Highlighting color",
				fr: "Couleur de surlignage"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('hiliteColor');
				}
			}
		},
		fontSize: [
			{
				option: [
					{
						content: "Very small",
						contentLanguage: {
							fr: "Tr??s petit"
						},
						value: "1"
					},
					{
						content: "A bit small",
						contentLanguage: {
							fr: "Un peut petit"
						},
						value: "2"
					},
					{
						content: "Normal",
						contentLanguage: {},
						value: "3"
					},
					{
						content: "Medium-large",
						contentLanguage: {
							fr: "Moyen-large"
						},
						value: "4"
					},
					{
						content: "Big",
						contentLanguage: {
							fr: "Gros"
						},
						value: "5"
					},
					{
						content: "Very big",
						contentLanguage: {
							fr: "Tr??s gros"
						},
						value: "6"
					},
					{
						content: "Maximum",
						contentLanguage: {},
						value: "7"
					}
				],
				event: {
					typeOfListner: "change",
					function(ca) {
						ca.edit('fontSize');
					}
				}
			},
			{
				title: {
					en: "Font size",
					fr: "Taille de police"
				}
			}
		],
		paste: {
			content: "<i class='fas fa-paste'></i>",
			contentLanguage: {},
			title: {
				en: "Paste",
				fr: "Coller"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit("paste");
				}
			}
		},
		cut: {
			content: "<i class='fas fa-cut'></i>",
			contentLanguage: {},
			title: {
				en: "Cut",
				fr: "Couper"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('cut');
				}
			}
		},
		copy: {
			content: "<i class='fas fa-copy'></i>",
			contentLanguage: {},
			title: {
				en: "Copy",
				fr: "Copier"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('copy');
				}
			}
		},
		strikeThrough: {
			content: "<i class='fas fa-strikethrough'></i>",
			contentLanguage: {},
			title: {
				en: "Strike through",
				fr: "Barrer"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('strikeThrough');
				}
			}
		},
		justifyFull: {
			content: "<i class='fas fa-align-justify'></i>",
			contentLanguage: {},
			title: {
				en: "Justify",
				fr: "Justifier"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('justifyFull');
				}
			}
		},
		justifyRight: {
			content: "<i class='fas fa-align-right'></i>",
			contentLanguage: {},
			title: {
				en: "Align right",
				fr: "Aligner ?? droite"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('justifyRight');
				}
			}
		},
		justifyCenter: {
			content: "<i class='fas fa-align-center'></i>",
			contentLanguage: {},
			title: {
				en: "Align center",
				fr: "Aligner au centre"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('justifyCenter');
				}
			}
		},
		justifyLeft: {
			content: "<i class='fas fa-align-left'></i>",
			contentLanguage: {},
			title: {
				en: "Align left",
				fr: "Aligner ?? gauche"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('justifyLeft');
				}
			}
		},
		applyFormat: {
			content: "<i class='fas fa-paint-roller'></i>",
			contentLanguage: {},
			title: {
				en: "Apply format",
				fr: "Appliquer le format"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit("formatBlock");
					ca.edit("fontSize");
					ca.edit("fontName");
				}
			}
		},
		removeFormat: {
			content: "<i class='fas fa-remove-format'></i>",
			contentLanguage: {},
			title: {
				en: "Remove format",
				fr: "Supprimer la mise en forme"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('removeFormat');
				}
			}
		},
		subscript: {
			content: "<i class='fas fa-subscript'></i>",
			contentLanguage: {},
			title: {
				en: "Subscript",
				fr: "Indice"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('subscript');
				}
			}
		},
		superscript: {
			content: "<i class='fas fa-superscript'></i>",
			contentLanguage: {},
			title: {
				en: "Superscript",
				fr: "Exposant"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('superscript');
				}
			}
		},
		undo: {
			content: "<i class='fas fa-undo'></i>",
			contentLanguage: {},
			title: {
				en: "Undo",
				fr: "Anuler"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('undo');
				}
			}
		},
		redo: {
			content: "<i class='fas fa-redo'></i>",
			contentLanguage: {},
			title: {
				en: "Redo",
				fr: "R??tablir"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('redo');
				}
			}
		},
		createLink: {
			content: "<i class='fas fa-link'></i>",
			contentLanguage: {},
			title: {
				en: "Insert link",
				fr: "Ins??rer un lien"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit("createLink");
				}
			}
		},
		insertImage: {
			content: "<i class='fas fa-image'></i>",
			contentLanguage: {},
			title: {
				en: "Insert image",
				fr: "Ins??rer une image"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit("insertImage");
				}
			}
		},
		code: {
			content: "<i class='fas fa-code'></i>",
			contentLanguage: {},
			title: {
				en: "Source code",
				fr: "Code source"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.switchCode();
				}
			}
		},
		bold: {
			content: "<i class='fas fa-bold'></i>",
			contentLanguage: {
				fr: "<b>G</b>"
			},
			title: {
				en: "Bold",
				fr: "Gras"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('bold');
				}
			}
		},
		underline: {
			content: "<i class='fas fa-underline'></i>",
			contentLanguage: {
				fr: "<u>S</u>"
			},
			title: {
				en: "Underline",
				fr: "Souligner"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('underline');
				}
			}
		},
		italic: {
			content: "<i class='fas fa-italic'></i>",
			contentLanguage: {},
			title: {
				en: "Italic",
				fr: "Italique"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('italic');
				}
			}
		},
		insertOrderedList: {
			content: "<i class='fas fa-list-ol'></i>",
			contentLanguage: {},
			title: {
				en: "Ordered list",
				fr: "Liste num??rot??e"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('insertOrderedList');
				}
			}
		},
		insertUnorderedList: {
			content: "<i class='fas fa-list-ul'></i>",
			contentLanguage: {},
			title: {
				en: "Unordered list",
				fr: "Liste ?? puces"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('insertUnorderedList');
				}
			}
		},
		outdent: {
			content: "<i class='fas fa-outdent'></i>",
			contentLanguage: {},
			title: {
				en: "Outdent",
				fr: "Diminuer le retrait"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('outdent');
				}
			}
		},
		indent: {
			content: "<i class='fas fa-indent'></i>",
			contentLanguage: {},
			title: {
				en: "Indent",
				fr: "Augmenter le retrait"
			},
			event: {
				typeOfListner: "click",
				function(ca) {
					ca.edit('indent');
				}
			}
		},
		font: [
			{
				option: [
					{
						content: "Serif",
						contentLanguage: {},
						value: "serif"
					},
					{
						content: "Sans serif",
						contentLanguage: {},
						value: "sans-serif"
					},
					{
						content: "Monospace",
						contentLanguage: {},
						value: "monospace"
					}
				],
				event: {
					typeOfListner: "change",
					function(ca) {
						ca.edit('fontName');
					}
				}
			},
			{
				title: {
					en: "Font",
					fr: "Police"
				}
			}
		],
		title: [
			{
				option: [
					{
						content: "Normal",
						contentLanguage: {},
						value: "pre"
					},
					{
						content: "Title 1",
						contentLanguage: {
							fr: "Titre 1"
						},
						value: "h1"
					},
					{
						content: "Title 2",
						contentLanguage: {
							fr: "Titre 2"
						},
						value: "h2"
					},
					{
						content: "Title 3",
						contentLanguage: {
							fr: "Titre 3"
						},
						value: "h3"
					},
					{
						content: "Title 4",
						contentLanguage: {
							fr: "Titre 4"
						},
						value: "h4"
					}
				],
				event: {
					typeOfListner: "change",
					function(ca) {
						ca.edit('formatBlock');
					}
				}
			},
			{
				title: {
					en: "Title",
					fr: "Titre"
				}
			}
		]
	},
	popupDef: {
		color: {
			// title: {
			// 	content: "Custom",
			// 	contentLanguage: {
			// 		fr: "Personnalis??"
			// 	},
			// },
			default: [
				{
					color: "#000000",
					title: {
						en: "black",
						fr: "noir"
					}, 
				},
				{
					color: "#434343",
					title: {
						en: "dark gray 4",
						fr: "gris fonc?? 4"
					}, 
				},
				{
					color: "#666666",
					title: {
						en: "dark gray 3",
						fr: "gris fonc?? 3"
					}, 
				},
				{
					color: "#999999",
					title: {
						en: "dark gray 2",
						fr: "gris fonc?? 2"
					}, 
				},
				{
					color: "#b7b7b7",
					title: {
						en: "dark gray 1",
						fr: "gris fonc?? 1"
					}, 
				},
				{
					color: "#cccccc",
					title: {
						en: "gray",
						fr: "gris"
					}, 
				},
				{
					color: "#d9d9d9",
					title: {
						en: "light gray 1",
						fr: "gris clair 1"
					}, 
				},
				{
					color: "#efefef",
					title: {
						en: "light gray 2",
						fr: "gris clair 2"
					}, 
				},
				{
					color: "#f3f3f3",
					title: {
						en: "light gray 3",
						fr: "gris clair 3"
					}, 
				},
				{
					color: "#ffffff",
					title: {
						en: "white",
						fr: "blanc"
					}, 
				},
				{
					color: "#980000",
					title: {
						en: "red fruits",
						fr: "fruits rouges"
					}, 
				},
				{
					color: "#ff0000",
					title: {
						en: "red",
						fr: "rouge"
					}, 
				},
				{
					color: "#ff9900",
					title: {
						en: "orange",
						fr: "orange"
					}, 
				},
				{
					color: "#feff00",
					title: {
						en: "yellow",
						fr: "jaune"
					}, 
				},
				{
					color: "#00ff00",
					title: {
						en: "green",
						fr: "vert"
					}, 
				},
				{
					color: "#00ffff",
					title: {
						en: "cyan",
						fr: "cyan"
					}, 
				},
				{
					color: "#4986e8",
					title: {
						en: "cornflower blue",
						fr: "bleu bleuet"
					}, 
				},
				{
					color: "#1c00ff",
					title: {
						en: "blue",
						fr: "bleu"
					}, 
				},
				{
					color: "#9900ff",
					title: {
						en: "purple",
						fr: "violet"
					}, 
				},
				{
					color: "#ff00ff",
					title: {
						en: "magenta",
						fr: "magenta"
					}, 
				},
				{
					color: "#e6b8af",
					title: {
						en: "light red fruits 3",
						fr: "fruits rouges clair 3"
					}, 
				},
				{
					color: "#f4cccc",
					title: {
						en: "light red 3",
						fr: "rouge clair 3"
					}, 
				},
				{
					color: "#fbe6cd",
					title: {
						en: "light orange 3",
						fr: "orange clair 3"
					}, 
				},
				{
					color: "#fff1cc",
					title: {
						en: "light yellow 3",
						fr: "jaune clair 3"
					}, 
				},
				{
					color: "#d9ead3",
					title: {
						en: "light green 3",
						fr: "vert clair 3"
					}, 
				},
				{
					color: "#d0dfe3",
					title: {
						en: "light cyan 3",
						fr: "cyan clair 3"
					}, 
				},
				{
					color: "#c8daf8",
					title: {
						en: "light cornflower blue 3",
						fr: "bleu bleuet clair 3"
					}, 
				},
				{
					color: "#d0e1f3",
					title: {
						en: "light blue 3",
						fr: "bleu clair 3"
					}, 
				},
				{
					color: "#d0e1f3",
					title: {
						en: "light purple 3",
						fr: "violet clair 3"
					}, 
				},
				{
					color: "#ead1db",
					title: {
						en: "light magenta 3",
						fr: "magenta clair 3"
					}, 
				},
				{
					color: "#dd7f6b",
					title: {
						en: "light red fruits 2",
						fr: "fruits rouges clair 2"
					}, 
				},
				{
					color: "#ea9a99",
					title: {
						en: "light red 2",
						fr: "rouge clair 2"
					}, 
				},
				{
					color: "#facb9c",
					title: {
						en: "light orange 2",
						fr: "orange clair 2"
					}, 
				},
				{
					color: "#ffe59a",
					title: {
						en: "light yellow 2",
						fr: "jaune clair 2"
					}, 
				},
				{
					color: "#b5d7a8",
					title: {
						en: "light green 2",
						fr: "vert clair 2"
					}, 
				},
				{
					color: "#a3c4c9",
					title: {
						en: "light cyan 2",
						fr: "cyan clair 2"
					}, 
				},
				{
					color: "#a4c2f4",
					title: {
						en: "light cornflower blue 2",
						fr: "bleu bleuet clair 2"
					}, 
				},
				{
					color: "#9fc5e8",
					title: {
						en: "light blue 2",
						fr: "bleu clair 2"
					}, 
				},
				{
					color: "#b5a7d5",
					title: {
						en: "light purple 2",
						fr: "violet clair 2"
					}, 
				},
				{
					color: "#d5a6bd",
					title: {
						en: "light magenta 2",
						fr: "magenta clair 2"
					}, 
				},
				{
					color: "#cd4025",
					title: {
						en: "light red fruits 1",
						fr: "fruits rouges clair 1"
					}, 
				},
				{
					color: "#e06666",
					title: {
						en: "light red 1",
						fr: "rouge clair 1"
					}, 
				},
				{
					color: "#f6b26b",
					title: {
						en: "light orange 1",
						fr: "orange clair 1"
					}, 
				},
				{
					color: "#ffd966",
					title: {
						en: "light yellow 1",
						fr: "jaune clair 1"
					}, 
				},
				{
					color: "#92c47d",
					title: {
						en: "light green 1",
						fr: "vert clair 1"
					}, 
				},
				{
					color: "#75a5b0",
					title: {
						en: "light cyan 1",
						fr: "cyan clair 1"
					}, 
				},
				{
					color: "#6d9feb",
					title: {
						en: "light cornflower blue 1",
						fr: "bleu bleuet clair 1"
					}, 
				},
				{
					color: "#70a7dc",
					title: {
						en: "light blue 1",
						fr: "bleu clair 1"
					}, 
				},
				{
					color: "#8e7cc3",
					title: {
						en: "light purple 1",
						fr: "violet clair 1"
					}, 
				},
				{
					color: "#c27ba0",
					title: {
						en: "light magenta 1",
						fr: "magenta clair 1"
					}, 
				},
				{
					color: "#a61d00",
					title: {
						en: "dark red fruits 1",
						fr: "fruits rouges fonc?? 1"
					}, 
				},
				{
					color: "#cc0200",
					title: {
						en: "dark red 1",
						fr: "rouge fonc?? 1"
					}, 
				},
				{
					color: "#e69138",
					title: {
						en: "dark orange 1",
						fr: "orange fonc?? 1"
					}, 
				},
				{
					color: "#f1c331",
					title: {
						en: "dark yellow 1",
						fr: "jaune fonc?? 1"
					}, 
				},
				{
					color: "#6aa84f",
					title: {
						en: "dark green 1",
						fr: "vert fonc?? 1"
					}, 
				},
				{
					color: "#45818e",
					title: {
						en: "dark cyan 1",
						fr: "cyan fonc?? 1"
					}, 
				},
				{
					color: "#3c78d8",
					title: {
						en: "dark cornflower blue 1",
						fr: "bleu bleuet fonc?? 1"
					}, 
				},
				{
					color: "#3e84c6",
					title: {
						en: "dark blue 1",
						fr: "bleu fonc?? 1"
					}, 
				},
				{
					color: "#674ea7",
					title: {
						en: "dark purple 1",
						fr: "violet fonc?? 1"
					}, 
				},
				{
					color: "#a64d79",
					title: {
						en: "dark magenta 1",
						fr: "magenta fonc?? 1"
					}, 
				},
				{
					color: "#85210c",
					title: {
						en: "dark red fruits 2",
						fr: "fruits rouges fonc?? 2"
					}, 
				},
				{
					color: "#990000",
					title: {
						en: "dark red 2",
						fr: "rouge fonc?? 2"
					}, 
				},
				{
					color: "#b55e06",
					title: {
						en: "dark orange 2",
						fr: "orange fonc?? 2"
					}, 
				},
				{
					color: "#bf9001",
					title: {
						en: "dark yellow 2",
						fr: "jaune fonc?? 2"
					}, 
				},
				{
					color: "#38761d",
					title: {
						en: "dark green 2",
						fr: "vert fonc?? 2"
					}, 
				},
				{
					color: "#134f5c",
					title: {
						en: "dark cyan 2",
						fr: "cyan fonc?? 2"
					}, 
				},
				{
					color: "#1356cc",
					title: {
						en: "dark cornflower blue 2",
						fr: "bleu bleuet fonc?? 2"
					}, 
				},
				{
					color: "#0c5494",
					title: {
						en: "dark blue 2",
						fr: "bleu fonc?? 2"
					}, 
				},
				{
					color: "#361c75",
					title: {
						en: "dark purple 2",
						fr: "violet fonc?? 2"
					}, 
				},
				{
					color: "#741a47",
					title: {
						en: "dark magenta 2",
						fr: "magenta fonc?? 2"
					}, 
				},
				{
					color: "#5a0f00",
					title: {
						en: "dark red fruits 3",
						fr: "fruits rouges fonc?? 3"
					}, 
				},
				{
					color: "#660000",
					title: {
						en: "dark red 3",
						fr: "rouge fonc?? 3"
					}, 
				},
				{
					color: "#773f05",
					title: {
						en: "dark orange 3",
						fr: "orange fonc?? 3"
					}, 
				},
				{
					color: "#7f6001",
					title: {
						en: "dark yellow 3",
						fr: "jaune fonc?? 3"
					}, 
				},
				{
					color: "#284d13",
					title: {
						en: "dark green 3",
						fr: "vert fonc?? 3"
					}, 
				},
				{
					color: "#0c343d",
					title: {
						en: "dark cyan 3",
						fr: "cyan fonc?? 3"
					}, 
				},
				{
					color: "#1d4586",
					title: {
						en: "dark cornflower blue 3",
						fr: "bleu bleuet fonc?? 3"
					}, 
				},
				{
					color: "#083763",
					title: {
						en: "dark blue 3",
						fr: "bleu fonc?? 3"
					}, 
				},
				{
					color: "#20124d",
					title: {
						en: "dark purple 3",
						fr: "violet fonc?? 3"
					}, 
				},
				{
					color: "#4c1230",
					title: {
						en: "dark magenta 3",
						fr: "magenta fonc?? 3"
					}, 
				},
			],
			noColor: {
				content: "<i class=\"fas fa-tint-slash\"></i>Transparent",
				contentLanguage: {
					fr: "<i class=\"fas fa-tint-slash\"></i>Aucune"
				},
			}
		},
		linkBtn: {
			text: {
				content: "Text",
				contentLanguage: {
					fr: "Texte"
				},
			},
			link: {
				content: "Link",
				contentLanguage: {
					fr: "Lien"
				},
			},
			embeddedImage: {
				content: "Embedded image",
				contentLanguage: {
					fr: "Image int??gr??e"
				},
			},
			target: {
				content: "Open start new tab",
				contentLanguage: {
					fr: "S'ouvre dans un nouvel onglet"
				},
			},
			title: {
				content: "Title",
				contentLanguage: {
					fr: "Titre"
				},
			},
			cancel: {
				content: "Cancel",
				contentLanguage: {
					fr: "Annuler"
				},
			},
			validate: {
				content: "Validate",
				contentLanguage: {
					fr: "Valider"
				},
			}
		},
		linkInfo: {
			copy: {
				content: "Copy link",
				contentLanguage: {
					fr: "Copier le lien"
				},
			},
			edit: {
				content: "Edit link",
				contentLanguage: {
					fr: "Modifier le lien"
				},
			},
			unlink: {
				content: "Delete link",
				contentLanguage: {
					fr: "Supprimer le lien"
				},
			},
		},
		linkEdit: {
			link: {
				content: "Link",
				contentLanguage: {
					fr: "Lien"
				},
			},
			title: {
				content: "Title",
				contentLanguage: {
					fr: "Titre"
				},
			},
			validate: {
				content: "Validate",
				contentLanguage: {
					fr: "Valider"
				},
			}
		}
	},
}

export default conf;