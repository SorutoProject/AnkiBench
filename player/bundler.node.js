const cheerio = require("cheerio");
const fs = require("fs");

const originHTML = fs.readFileSync("./index.html","utf8");
const $ = cheerio.load(originHTML,{decodeEntities: false});


$('head link[rel="stylesheet"]').each(function(index,elem){
	const src = $(elem).attr("href");
	console.log(src);
	$(elem).remove();
	$("head").append(`<style>${fs.readFileSync(src,"utf8")}</style>`);
});

$("head script:not(type)").each(function(index,elem){
	const src = $(elem).attr("src");
	console.log(src);
	$(elem).remove();
	$("head").append(`<script>${fs.readFileSync(src,"utf8")}</script>`);
});

const html = $.html();

//export bundled html
fs.writeFileSync("index.bundle.html",html);

//export builder
const builderCode = `const ankibenchBuilder = function(code){
	const ankibenchHTML = \`${encodeURIComponent(html)}\`;
	const exportHTML = decodeURIComponent(ankibenchHTML).split("<ankibench-code />").join(JSON.stringify(code));
	return exportHTML;
}`;

fs.writeFileSync("../ankibench.builder.js",builderCode)
console.log("Success!");