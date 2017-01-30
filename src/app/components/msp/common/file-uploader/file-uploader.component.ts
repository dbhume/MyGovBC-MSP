import {
  Component, ViewChild, ElementRef, OnInit, EventEmitter, ViewContainerRef, Output, Input,
  Inject
} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MspImage} from '../../model/msp-image';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import {ModalDirective} from "ng2-bootstrap";

let loadImage = require('blueimp-load-image');

var sha1 = require('sha1');

require('./file-uploader.component.less');
@Component({
  selector: 'msp-file-uploader',
  templateUrl: './file-uploader.html'
})
export class FileUploaderComponent implements OnInit {
  lang = require('./i18n');

  @ViewChild('previewZone') previewZone: ElementRef;
  @ViewChild('dropZone') dropZone: ElementRef;
  @ViewChild('browseFileRef') browseFileRef: ElementRef;
  @ViewChild('captureFileRef') captureFileRef: ElementRef;
  @ViewChild('errorModal') public fullSizeViewModal: ModalDirective;

  private trustedUrl: SafeUrl;
  private maxFileSize: number;
  private fileSizeError: string;
  private MAX_IMAGE_COUNT: number = 10;

  imageWithError: MspImage;

  @Input() images: Array<MspImage>;
  @Input() id: string;

  @Output() onAddDocument: EventEmitter<MspImage> = new EventEmitter<MspImage>();
  @Output() onDeleteDocument: EventEmitter<MspImage> = new EventEmitter<MspImage>();

  constructor(private sanitizer: DomSanitizer,
              private viewContainerRef: ViewContainerRef,
              @Inject('appConstants') private appConstants: Object) {
    this.maxFileSize = 8 * 1024 * 1024;
  }

  ngOnInit(): void {
    // console.log('subscribe to drop event.');
    var dragOverStream =
      Observable.fromEvent<DragEvent>(this.dropZone.nativeElement, "dragover");

    /**
     * Must cancel the dragover event in order for the drop event to work.
     */
    dragOverStream.map(evt => {
      return event;
    }).subscribe(evt => {
      // console.log('Cancel dragover event.');
      evt.preventDefault();
    });

    var dropStream = Observable.fromEvent<DragEvent>(this.dropZone.nativeElement, "drop");

    var filesArrayFromDrop = dropStream.map(
      function (event) {
        event.preventDefault();
        return event.dataTransfer.files;
      }
    )

    var browseFileStream = Observable.fromEvent<Event>(this.browseFileRef.nativeElement, 'change');
    var captureFileStream = Observable.fromEvent<Event>(this.captureFileRef.nativeElement, 'change');

    var filesArrayFromInput = browseFileStream.merge(captureFileStream)
      .map(
        (event) => {
          event.preventDefault();
          return event.target['files'];
        }
      ).merge(filesArrayFromDrop)
      .filter(files => {
        return !!files && files.length && files.length > 0;
      }).filter((files) => {
        return files[0].size <= this.maxFileSize;
      }).flatMap(
        (fileList: FileList) => {
          return this.observableFromFile(fileList[0]);
        }
      ).filter(
        (mspImage: MspImage) => {
          return !this.checkImageExists(mspImage, this.images);
        }
      )
      .subscribe(
        (file: MspImage) => {

          this.handleImageFile(file);
        },

        (error) => {
          console.log('drop event error detected:');
          console.log(error);
        }
      );
  }

  observableFromFile(file: File) {
    // Init
    let reader: FileReader = new FileReader();
    let mspImage: MspImage = new MspImage();

    // Copy file properties
    mspImage.name = file.name;
    mspImage.contentType = file.type;

    let self = this;

    // First scale the image
    let scaledImage = loadImage(
      file,
      function (canvas: HTMLCanvasElement) {

        // While it's still in a canvas, get it's height and width
        mspImage.naturalWidth = canvas.width;
        mspImage.naturalHeight = canvas.height;

        console.log(`image file natural height and width: 
            ${mspImage.naturalHeight} x ${mspImage.naturalWidth}`);

        // Convert to grayscale
        //self.makeGrayScale(canvas);

        // Convert to blob
        canvas.toBlob((blob: Blob) => {

            // Copy the blob properties
            mspImage.size = blob.size;

            let nBytes = mspImage.size;
            let fileSize = '';
            let fileSizeUnit = '';
            let sOutput: string = nBytes + " bytes";
            // optional code for multiples approximation
            for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
              sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
              fileSize = nApprox.toFixed(0);
              fileSizeUnit = aMultiples[nMultiple];
            }

            console.log(`Size of file ${name}: ${sOutput}`);
            mspImage.sizeTxt = sOutput;


            // call reader with new transformed image
            reader.readAsDataURL(blob);

          },
          // What mime type to make the blob as
          mspImage.contentType);
      },
      {
        maxWidth: 2600,
        maxHeight: 3300,
        contain: true,
        canvas: true
      }
    );

    // This method will convert blob to a data URL
    let fileObservable = Observable.create((observer: any) => {
      reader.onload = function (evt: any) {

        mspImage.fileContent = reader.result;
        mspImage.id = sha1(reader.result);

        observer.next(mspImage);
        observer.complete();
      }
    });

    return fileObservable;
  }

  /**
   * Non reversible image filter to take an existing canvas and make it gray scale
   * @param canvas
   */
  makeGrayScale(canvas: HTMLCanvasElement): void {
    let context = canvas.getContext('2d');

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      // red
      data[i] = brightness;
      // green
      data[i + 1] = brightness;
      // blue
      data[i + 2] = brightness;
    }

    // overwrite original image
    context.putImageData(imageData, 0, 0);
  }


  handleImageFile(mspImage: MspImage) {
    if (this.images.length >= this.MAX_IMAGE_COUNT) {
      console.log(`Max number of image file you can upload is ${this.MAX_IMAGE_COUNT}. 
      This file ${mspImage.name} was not uploaded.`);
    } else {
      this.onAddDocument.emit(mspImage);
    }
  }


  getFileSizeOutputString(file: File) {
    let nBytes = file.size;
    let fileSize = '';
    let fileSizeUnit = '';
    let name = file.name;
    let sOutput: string = nBytes + " bytes";
    // optional code for multiples approximation
    for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
      sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
      fileSize = nApprox.toFixed(0);
      fileSizeUnit = aMultiples[nMultiple];
    }
    console.log(`Size of file ${name}: ${sOutput}`);
    return sOutput;
  }

  deleteImage(mspImage: MspImage) {
    this.onDeleteDocument.emit(mspImage);
  }

  /**
   * Return true if file already exists in the list; false otherwise.
   */
  checkImageExists(file: MspImage, imageList: Array<MspImage>) {
    if (!imageList) {
      return false;
    } else {
      let sha1Sum = sha1(file.fileContent);
      for (var i = imageList.length - 1; i >= 0; i--) {
        // console.log(`compare  ${imageList[i].id} with ${sha1Sum}, result ${imageList[i].id === sha1Sum}`);
        if (imageList[i].id === sha1Sum) {
          console.log(`This file ${file.name} has already been uploaded.`);
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Get the current image count
   */
  imageCount() {
    return this.images.length;
  }

  get MAX_NUM_IMAGES(): number {
    return this.MAX_IMAGE_COUNT;
  }

}