import { TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms';
import { AssistancePersonalInfoComponent } from './personal-info.component';
import MspDataService from '../../service/msp-data.service';
import { LocalStorageService, LOCAL_STORAGE_SERVICE_CONFIG } from 'angular-2-local-storage';
import {MspPhnComponent} from "../../common/phn/phn.component";
import {MspNameComponent} from "../../common/name/name.component";
import {MspBirthDateComponent} from "../../common/birthdate/birthdate.component";
import {MspAddressComponent} from "../../common/address/address.component";
import {Mod11CheckValidator} from "../../common/phn/phn.validator";
import {MspProvinceComponent} from "../../common/province/province.component";
import {Ng2CompleterModule} from "ng2-completer";
import {AssistancePersonalDetailComponent} from "./personal-details/personal-details.component";
import {MspPhoneComponent} from "../../common/phone/phone.component";

describe('AssistancePersonalDetailComponent', () => {
  let localStorageServiceConfig = {
    prefix: 'ca.bc.gov.msp',
    storageType: 'localStorage'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssistancePersonalInfoComponent, AssistancePersonalDetailComponent,
        MspPhnComponent, MspNameComponent, MspPhoneComponent,
        MspBirthDateComponent, MspAddressComponent, MspProvinceComponent,
        Mod11CheckValidator],
      imports: [FormsModule, Ng2CompleterModule],
      providers: [MspDataService,
        LocalStorageService,{
          provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: localStorageServiceConfig
        }
      ]
    })
  });
  it ('should work', () => {
    let fixture = TestBed.createComponent(AssistancePersonalInfoComponent);
    expect(fixture.componentInstance instanceof AssistancePersonalInfoComponent).toBe(true, 'should create AssistancePersonalInfoComponent');

  });
})
