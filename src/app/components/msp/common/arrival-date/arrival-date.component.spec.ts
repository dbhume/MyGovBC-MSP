import { TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms';
import { MspArrivalDateComponent } from './arrival-date.component';
import MspDataService from '../../service/msp-data.service';
import { LocalStorageService, LOCAL_STORAGE_SERVICE_CONFIG } from 'angular-2-local-storage';
import {Ng2CompleterModule} from "ng2-completer";

describe('MspArrivalDateComponent', () => {
  let localStorageServiceConfig = {
    prefix: 'ca.bc.gov.msp',
    storageType: 'localStorage'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MspArrivalDateComponent],
      imports: [FormsModule, Ng2CompleterModule],
      providers: [MspDataService,
        LocalStorageService,{
          provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: localStorageServiceConfig
        }
      ]
    })
  });
  it ('should work', () => {
    let fixture = TestBed.createComponent(MspArrivalDateComponent);
    expect(fixture.componentInstance instanceof MspArrivalDateComponent).toBe(true, 'should create MspArrivalDateComponent');

  });
})
