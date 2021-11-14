const fs = require('fs');
const moment = require('moment');
const htmlTemplate = fs.readFileSync('./pdf_templates/analysis_report/analysis.html', 'utf8');
const singleInstanceHtmlTemplate = fs.readFileSync('./pdf_templates/analysis_report/analysis_section.html', 'utf8');
const pdf = require('./PdfGenerator');
const revoked =require('../constants/passportConstant')
// const options = { format: 'A4',  "orientation": "portrait"};
const options = { format: 'A4 ',  "orientation": "landscape"};
const templateEngine = require('../util/templateEngine')
const objectManipulate = require('../util/objectManipulationUtil')

class AnalysisGenerator {
  constructor() {

    // <li class="px-2">{{partyB}}</li>
    // <li class="px-2">{{partyB}}</li>
    // <li class="px-2">{{partyB}}</li>
    // <li class="px-2">{{partyB}}</li>
    // <li class="px-2">{{partyB}}</li>
    // <li class="px-2">{{partyB}}</li>
  }

  mergeMultipleResponseIntoOneHtml(body) {
    var groupedHtmlInstances = "";
    for (let i = 0; i < body.length; i++) {
        var tempInstance = singleInstanceHtmlTemplate;
        tempInstance = templateEngine.replacer(tempInstance, body[i].analysisReport);
        const imeiNumbersAsCommaSeperatedString = objectManipulate.createCommaSeperatedStringFromArray(body[i].analysisReport.deviceInfo.imeiNumbers);
        const imsiNumbersAsCommaSeperatedString = objectManipulate.createCommaSeperatedStringFromArray(body[i].analysisReport.deviceInfo.imsiNumbers);
        const msisdnsAsCommaSeperatedString = objectManipulate.createCommaSeperatedStringFromArray(body[i].analysisReport.deviceInfo.msisdns);
        const topContactedPeople = objectManipulate.createSerialListOfTopContactedPeople(body[i].analysisReport.topContactedPeople);
        tempInstance = tempInstance.replace('{{deviceInfo.imeiNumbers}}', imeiNumbersAsCommaSeperatedString);
        tempInstance = tempInstance.replace('{{deviceInfo.imsiNumbers}}', imsiNumbersAsCommaSeperatedString);
        tempInstance = tempInstance.replace('{{deviceInfo.msisdns}}', msisdnsAsCommaSeperatedString);
        tempInstance = tempInstance.replace('{{topContactedPeople}}', topContactedPeople);
        groupedHtmlInstances += tempInstance + "\n";
    }
    var htmlTemplateInstance = htmlTemplate;
    htmlTemplateInstance = htmlTemplateInstance.replace('{{analysisSection}}', groupedHtmlInstances);
    htmlTemplateInstance = htmlTemplateInstance.replace('{{linkAnalysisImage}}', body.linkAnalysisImage);
    return htmlTemplateInstance;
  }

  generate(res, body) {
    const mergedHtmlTemplateInstance = this.mergeMultipleResponseIntoOneHtml(body);
    pdf.generatePdfFromHtml(mergedHtmlTemplateInstance, res, options)
  }
}
module.exports = AnalysisGenerator;