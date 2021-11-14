
const pdf = require('html-pdf');
const templateEngine = require('../util/templateEngine')

const pdfGenerator = function (htmlTemplate,json,res,options){
    const html = templateEngine.replacer(htmlTemplate,json)
    pdf.create(html, options).toStream(function(err, stream) {
        if (err) return console.log(err);
        stream.pipe(res);
    });
}

const generatePdfFromHtml = function (html, res, options) {
    pdf.create(html, options).toStream(function(err, stream) {
        if (err) {
            return console.log(err);
        }
        stream.pipe(res);
    });
}

module.exports = {pdfGenerator, generatePdfFromHtml}