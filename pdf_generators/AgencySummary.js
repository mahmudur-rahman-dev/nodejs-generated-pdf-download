const fs = require('fs');
const htmlTemplate = fs.readFileSync('./pdf_templates/agency-summary/agencySummary.html', 'utf8');
const pdf = require('./PdfGenerator');
const options = { format: 'A4',  "orientation": "landscape"};
const moment = require('moment');
class AgencySummary {
  constructor() {
  }


  generate(res, body, reportType) {
      let count=0;
      var dataRows = "";
      body.requestSummary.forEach(data => {
          count++;
          let dataRow = `<td>${count}</td>`
          dataRow += `<td>${reportType.ID == 1 ? data.agency : data.user.name}</td>`
          dataRow += ` <td>${data.CDR || 0}</td>`
          dataRow +=  `<td>${data.ESAF || 0}</td>`
          dataRow +=  `<td>${data.SMS || 0}</td>`
          dataRow += `<td>${data.LRL || 0}</td>`
          dataRow +=  `<td>${data.NID || 0}</td>`
          dataRow += `<td>${data.DRIVINGLICENSE || 0}</td>`
          dataRow +=  `<td>${data.PASSPORT || 0}</td>`
          dataRow += `<td>${data.VEHICLEREGISTRATION || 0}</td>`
          dataRow += `<td>${data.BIRTHREGISTRATION || 0}</td>`
          dataRow +=  `<td>${data.TOTAL || 0}</td>`
          dataRows += "<tr>"+dataRow+"</tr>"
      });
      const json = {"dataRow":dataRows}
      // json.startTime = moment("12/2/2020").format("MM/DD/YYYY");
      // json.endTime = moment("12/5/2020").format("MM/DD/YYYY");
      json.startTime = moment(body.startDate).format("MM/DD/YYYY");
      json.endTime = moment(body.endDate).format("MM/DD/YYYY");
      json.agencyOrUserCaption = reportType.COLUMN_CAPTION;

    pdf.pdfGenerator(htmlTemplate, json, res,options)
  }
}
module.exports = AgencySummary;