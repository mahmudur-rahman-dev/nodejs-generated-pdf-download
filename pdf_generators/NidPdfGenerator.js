"use strict";
const PDFDocument = require("pdfkit");
const { demoImageSmall } = require("../constants/base64Images");
const { AvailableFonts } = require("../constants/availableFonts");
const { LeftPanel, MiddleAndRightPanel } = require("../constants/nidLabels");
const { output } = require("pdfkit");
// const options = {size: 'A4',layout:'landscape'};
const options = {size: 'A4'};
class NidPdfGenerator {
  constructor(nidModel) {
    this.nidModel = nidModel;
    // this.margin = 10;
    this.pdfWidth = 595;
    this.contentHeight = 600;
    this.imageWidth = 230;
    this.imageHeight = 200;
    this.beginningOfPageForLeftPanelX = 20;
    this.beginningOfPageForLeftPanelY = 40;
    this.beginningOfPageForMiddlePanelX = this.imageWidth + (3 * this.beginningOfPageForLeftPanelX);
    this.beginningOfPageForRightPanelX = this.beginningOfPageForMiddlePanelX + (this.pdfWidth - ( (2 * this.beginningOfPageForLeftPanelX) + this.beginningOfPageForMiddlePanelX)) / 2;
    this.verticalSpaceIncrement = 5;
    this.verticalNewSectionIncrement = 20;
    this.labelFontSize = 10;
    this.infoFontSize = 14;
    this.labelFont = AvailableFonts.HELVETICA;
    this.infoFont = "./fonts/SolaimanLipi_Bold_10-03-12.ttf";
    this.infoWidth = (this.pdfWidth - ((2 * this.beginningOfPageForLeftPanelX) + this.beginningOfPageForMiddlePanelX)) / 2;
  }

  generateHeaders(doc) {
    // doc.image(new Buffer(demoImage.replace('data:image/png;base64,',''), 'base64'), 100, 100);
    // doc
    //     .image(new Buffer(demoImage.replace('data:image/png;base64,',''), 'base64'),
    //                         0, 10,
    //                         { width: 150})
    //     .fillColor('#000')
    //     .fontSize(20)
    //     .text('NID Information', 275, 50, {align: 'right'})
    //     .fontSize(10)
    //     .text(`Nid Number: ${this.nidModel.nid17Digit}`, {align: 'right'});
    // const beginningOfPage = 30
    // const endOfPage = 580
    // doc.moveTo(beginningOfPage,120)
    //     .lineTo(endOfPage,120)
    //     .stroke()
    // doc.moveTo(beginningOfPage,123)
    //     .lineTo(endOfPage,123)
    //     .stroke()
  }

  generateInformationSection(doc) {
      let x, y, w, h;

      //background color for left image panel
     x = (this.beginningOfPageForLeftPanelX - 10);
     y = x + (this.beginningOfPageForLeftPanelY / 2);
     w = (this.beginningOfPageForMiddlePanelX - 40);
     h = 720;
     doc.roundedRect(x, y, w, h, 10)
        .fill("#FDECE3");

    x = (this.beginningOfPageForMiddlePanelX - 20);
    w = (this.pdfWidth - (this.beginningOfPageForMiddlePanelX - 20) - 10);
    h = 320;
    doc.roundedRect(x, y, w, h, 10)
        .fill("#ECF7F3");
    
    y = y + h + 10;
    h = 390;
    doc.roundedRect(x, y, w, h, 10)
        .fill("#E7EBF1");

    this.generateLeftImagePanel(doc);
    this.generateMiddleAndRightAdressPanel(doc);
  }

  generateLeftImagePanel(doc) {
    let vSpace = this.beginningOfPageForLeftPanelY;
    let nameFontSize = 20;
    let imageBuffer;

    imageBuffer = Buffer.from(this.nidModel.photo, "base64");

    try{
      doc
        .image(
          imageBuffer,
          this.beginningOfPageForLeftPanelX,
          vSpace,
          { fit: [this.imageWidth, this.imageHeight], align: 'center' }
        )
        .fillColor("#000");
    } catch (err) {
      console.error("Image is not a valid base 64 image: " + err);
      doc
        .image(
          Buffer.from(demoImageSmall,  "base64"),
          this.beginningOfPageForLeftPanelX,
          vSpace,
          { fit: [this.imageWidth, this.imageHeight], align: 'center' }
        )
        .fillColor("#000");
    }
    vSpace = vSpace + this.verticalSpaceIncrement + this.imageHeight + this.verticalNewSectionIncrement + this.infoFontSize;

    doc
      .font(this.infoFont)
      .fontSize(nameFontSize)
      .text(
        this.nidModel.name,
        this.beginningOfPageForLeftPanelX,
        vSpace,
        { width: this.imageWidth, align: "center" }
      );

    vSpace = vSpace + this.verticalNewSectionIncrement + nameFontSize;

    Object.keys(LeftPanel).forEach((key) => {
      let label = LeftPanel[key].caption;
      let info = this.nidModel[LeftPanel[key].infoKey];

      this.generateLabeWithInfo(
        doc,
        label,
        info,
        this.beginningOfPageForLeftPanelX,
        vSpace
      );
      vSpace = vSpace + this.labelFontSize + this.infoFontSize + this.verticalSpaceIncrement + this.verticalNewSectionIncrement;
    });
  }

  generateMiddleAndRightAdressPanel(doc) {
    let vSpace = this.beginningOfPageForLeftPanelY;
    const addressInfoWidth = (this.pdfWidth - (this.beginningOfPageForLeftPanelX + this.beginningOfPageForMiddlePanelX));
    
    doc
      .font(this.labelFont)
      .fontSize(this.labelFontSize)
      .text("Permanent Address", this.beginningOfPageForMiddlePanelX, vSpace, { width: 200, align: "left" })
      .font(this.infoFont)
      .fontSize(this.infoFontSize)
      .text(
        this.getAddress(this.nidModel.permanentAddress, false),
        this.beginningOfPageForMiddlePanelX,
        vSpace + (2 * this.labelFontSize),
        { 
            width: addressInfoWidth, 
            align: "left" 
        }
      );

    vSpace = vSpace + (8 * this.infoFontSize); 
    let startingVSpace = vSpace;
    let count = 0;

    Object.keys(MiddleAndRightPanel).forEach((key) => {

      if(key !== "NID_10_DIGIT" || key !== "NID_17_DIGIT") {
        let beginX = (count <= 3) ? this.beginningOfPageForMiddlePanelX : this.beginningOfPageForRightPanelX;
        
        if(count == 4) {
            vSpace = startingVSpace;
        }

        let label = MiddleAndRightPanel[key].caption;
        let info = this.nidModel.permanentAddress[MiddleAndRightPanel[key].infoKey];

        this.generateLabeWithInfo(
          doc,
          label,
          info,
          beginX,
          vSpace
        );
        vSpace = vSpace + this.labelFontSize + this.infoFontSize + this.verticalSpaceIncrement  + this.verticalNewSectionIncrement;
      }
      count++;
    });

    vSpace = vSpace + this.verticalNewSectionIncrement;

    doc
      .font(this.labelFont)
      .fontSize(this.labelFontSize)
      .text("Present Address", this.beginningOfPageForMiddlePanelX, vSpace, { width: 200, align: "left" })
      .font(this.infoFont)
      .fontSize(this.infoFontSize)
      .text(
        this.getAddress(this.nidModel.presentAddress, true),
        this.beginningOfPageForMiddlePanelX,
        vSpace + (2 * this.labelFontSize),
        { width: addressInfoWidth, align: "left" }
      );
      
      vSpace = vSpace  + (8 * this.infoFontSize); 
      startingVSpace = vSpace;
      count = 0;

      Object.keys(MiddleAndRightPanel).forEach((key) => {

        let beginX = (count <= 3) ? this.beginningOfPageForMiddlePanelX : this.beginningOfPageForRightPanelX;
              
        if(count == 4) {
            vSpace = startingVSpace;
        }

        let label = MiddleAndRightPanel[key].caption;
        let info = this.nidModel.presentAddress[MiddleAndRightPanel[key].infoKey];
  
        this.generateLabeWithInfo(
          doc,
          label,
          info,
          beginX,
          vSpace
        );
        vSpace = vSpace + this.labelFontSize + this.infoFontSize + this.verticalSpaceIncrement + this.verticalNewSectionIncrement;
        count++;
      });

      //print old nid
      this.generateLabeWithInfo(
        doc, 
        "Old NID",
        this.nidModel.nid17Digit,
        this.beginningOfPageForMiddlePanelX,
        vSpace
      );

      // vSpace = vSpace + this.labelFontSize + this.infoFontSize + this.verticalSpaceIncrement + this.verticalNewSectionIncrement;

      //print new nid
      this.generateLabeWithInfo(
        doc, 
        "New NID",
        this.nidModel.nid10Digit,
        this.beginningOfPageForRightPanelX + 10,
        vSpace
      );
  }

  getAddress(adressObj, isPresentAddress) {
    const plainAddress = isPresentAddress ?
                      this.getValidAddress(adressObj.mouzaOrMoholla) + this.getValidAddress(adressObj.unionOrWard) + this.getValidAddress(adressObj.postOffice) 
                      + this.getValidAddress(adressObj.upozila) + this.getValidAddress(adressObj.rmo) + this.getValidAddress(adressObj.district) 
                      + this.getValidAddress(adressObj.division)
                       : 
                       this.getValidAddress(adressObj.mouzaOrMoholla) + this.getValidAddress(adressObj.additionalVillageOrRoad)
                        + this.getValidAddress(adressObj.unionOrWard) + this.getValidAddress(adressObj.upozila)  + this.getValidAddress(adressObj.rmo)
                        + this.getValidAddress(adressObj.district) + this.getValidAddress(adressObj.division);

    return plainAddress;
  }

  getValidAddress(adress) {
    if(adress && adress.length > 0) {
      return adress + ", ";
    }
    return '';
  }

  generateLabeWithInfo(doc, label, info, beginX, beginY) {
    doc
      .font(this.labelFont)
      .fontSize(this.labelFontSize)
      .text(label, beginX, beginY, { width: this.infoWidth, align: "left" })
      .font(this.infoFont)
      .fontSize(this.infoFontSize)
      .text(info, 
        beginX, 
        beginY + this.labelFontSize + this.verticalSpaceIncrement, 
        { width: this.infoWidth, align: "left" });
  }

  generateFooter(doc) {}

  generate(res) {
    let theOutput = new PDFDocument(options);

    theOutput.pipe(res);

    this.generateInformationSection(theOutput);

    // write out file
    theOutput.end();
  }
}

module.exports = NidPdfGenerator;
