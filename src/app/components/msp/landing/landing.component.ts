import {Component, ViewChild} from '@angular/core';
import MspDataService from '../service/msp-data.service';
import { Router } from '@angular/router';
import {MspImage} from "../model/msp-image";
import {MspImageErrorModalComponent} from "../common/image-error-modal/image-error-modal.component";
import {FileUploaderComponent} from "../common/file-uploader/file-uploader.component";

require('./landing.component.less')

/**
 * Application for MSP
 *
 * IMG_2336.jpg
 * https://apps.gcpe.gov.bc.ca/jira/browse/PSPDN-255?filter=16000
 */
@Component({
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  lang = require('./i18n')

  images = new Array<MspImage>();
  @ViewChild('mspImageErrorModal') mspImageErrorModal: MspImageErrorModalComponent;
  @ViewChild('fileUploader') fileUploader: FileUploaderComponent;

  addDocument(evt:MspImage){
    console.log('parent image added: ', evt);
    this.images.push(evt);
    this.fileUploader.forceRender();
  }

  deleteDocument(evt:MspImage){
    this.images = this.images.filter(
      (mspImage:MspImage) => {
        return evt.uuid !== mspImage.uuid;
      }
    );
  }

  errorDocument(evt:MspImage) {
    this.mspImageErrorModal.imageWithError = evt;
    this.mspImageErrorModal.showFullSizeView();
    this.mspImageErrorModal.forceRender();
  }

  constructor(private mspDataService:MspDataService, private router: Router){

  }
  clearSavedFinAssisApp(){
    console.log('deleting saved fin assist app.');
    this.mspDataService.removeFinAssistApplication();
    this.router.navigate(['/msp/assistance/prepare']);
    
  }

  clearSavedMspApp(){
    this.mspDataService.removeMspApplication();
    this.router.navigate(['/msp/application/prepare']);
  }
}
