import {Address} from "./address.model";
import {Person} from "./person.model";
import {Relationship} from "./status-activities-documents";
import {Eligibility} from "./eligibility.model";
import {UUID} from "angular2-uuid";
import { MspImage } from "./msp-image";
import moment = require("moment");
import {ApplicationBase} from "./application-base.model";
import {AssistanceYear} from './assistance-year.model';
import * as _ from 'lodash';

export enum AssistanceApplicationType {
  CurrentYear,
  PreviousTwoYears,
  MultiYear
}

export class FinancialAssistApplication implements ApplicationBase {

  readonly uuid = UUID.UUID();

  assistYears:AssistanceYear[] = [];
  assistYeaDocs:MspImage[] = [];

  infoCollectionAgreement: boolean = false;

  applicantClaimForAttendantCareExpense:boolean = false;
  spouseClaimForAttendantCareExpense:boolean = false;
  childClaimForAttendantCareExpense:boolean = false;
  childClaimForAttendantCareExpenseCount:number = 1;

  _attendantCareExpense:number;

  private _attendantCareExpenseReceipts: MspImage[] = new Array<MspImage>();

  get attendantCareExpense():number {
    if(!!this._attendantCareExpense && !isNaN(this._attendantCareExpense)){
      return parseFloat(this._attendantCareExpense+ '');
    }else{
      return null;
    }
  }

  set attendantCareExpense(n:number) {
    this._attendantCareExpense = n || 0;
  }
  get attendantCareExpenseReceipts():MspImage[] {
    return this._attendantCareExpenseReceipts;
  }

  set attendantCareExpenseReceipts(receipts: MspImage[]) {
    this._attendantCareExpenseReceipts = receipts || [];
  }
  /**
   * Set by the API, not for client use
   */
  referenceNumber: string;

  eligibility: Eligibility = new Eligibility();
  /**
   * Person applying for assistance
   * @type {Person}
   */
  applicant: Person = new Person(Relationship.Applicant);

  /**
   * Spouse of person applying
   * @type {Person}
   */
  spouse: Person = new Person(Relationship.Spouse);

  private _netIncomelastYear:number;
  private _netIncomelastYearAsString:string;
  private _spouseIncomeLine236AsString:string;
  private _claimedChildCareExpense_line214AsString:string;
  private _reportedUCCBenefit_line117AsString:string;
  private _spouseDSPAmount_line125AsString:string;
  /**
   * line 236 on NOA
   */
  private _spouseIncomeLine236: number;

  private _childrenCount:number;
  /**
   * Line 214 on NOA
   */
  private _claimedChildCareExpense_line214: number;

  /**
   * Line 117 on NOA
   */
  private _reportedUCCBenefit_line117: number;

  /**
   * Line 125
   */
  private _spouseDSPAmount_line125: number;

  ageOver65:boolean;
  spouseAgeOver65: boolean;

  private _hasSpouseOrCommonLaw: boolean;


  /**
   * Applicant himself or herself eligible for disablity credit flag
   */
  private eligibleForDisabilityCredit:boolean;
  private spouseOrCommonLawEligibleForDisabilityCredit:boolean;

  childWithDisabilityCount:number = 0;

  _authorizedByApplicant:boolean;
  _authorizedBySpouse:boolean;
  _authorizedByAttorney:boolean;
  authorizedByApplicantDate: Date;

  powerOfAttorneyDocs:MspImage[] = [];
  get hasPowerOfAttorney(): boolean {
    return this.powerOfAttorneyDocs &&
        this.powerOfAttorneyDocs.length > 0;
  }

  set authorizedByApplicant(auth:boolean){
    this._authorizedByApplicant = auth;

    if(auth){
      this._authorizedByAttorney = false;
      this.authorizedByApplicantDate = moment().toDate();
    }
  }

  set authorizedBySpouse(auth:boolean){
    this._authorizedBySpouse = auth;
    if(auth){
      this._authorizedByAttorney = false;
    }
  }
  set authorizedByAttorney(auth:boolean){
    this._authorizedByAttorney = auth;
    if(auth){
      this._authorizedByApplicant = false;
      this._authorizedBySpouse = false;
    }
  }

  get authorizedByApplicant():boolean {
    return this._authorizedByApplicant;
  }
  get authorizedBySpouse():boolean {
    return this._authorizedBySpouse;
  }
  get authorizedByAttorney():boolean {
    return this._authorizedByAttorney;
  }
// GET SET for the netIncome
  get netIncomelastYearAsString():string {
    return this._netIncomelastYearAsString;
  }

  set netIncomelastYearAsString(n:string) {
    if(!_.isEmpty(n) && n !== null){
      let num = n.toString();
      let parsedNum:number = parseFloat(num.replace(',', ''));
      this._netIncomelastYear = parsedNum;
      this._netIncomelastYearAsString = n;
    }
  }
  get netIncomelastYear():number {
    return this._netIncomelastYear === null? null: this._netIncomelastYear;
  }

  set netIncomelastYear(n:number) {
    if(n !== null){
        // let parsedNum = parseFloat(num.replace(',', ''));
        this.netIncomelastYearAsString = n+'';
    }
  }
//End of GET SET for the netIncome
//GET SET for the SpouseIncome
  get spouseIncomeLine236AsString():string{
    return this._spouseIncomeLine236AsString;
  }
  set spouseIncomeLine236AsString(n:string){
    if(!_.isEmpty(n) && n !== null){
      let num = n.toString();
      let parsedNum = parseFloat(num.replace(',', ''));
      this._spouseIncomeLine236 = parsedNum;
      this._spouseIncomeLine236AsString = n;
    }
  }
  get spouseIncomeLine236():number{
    return this._spouseIncomeLine236 === null? null: this._spouseIncomeLine236;
  }

  set spouseIncomeLine236(n:number){
    if(!this.isEmptyString(n)){
      this._spouseIncomeLine236 = n;
    }
  }
//End of GET SET for the SpouseIncome
  isEmptyString(value: number){
    let temp:string = value+'';
    temp = temp.trim();
    return temp.length < 1;
  }
  get childrenCount():number {
    if(!this._childrenCount){
      return null;
    }else{
      let n = (!!this._childrenCount && !isNaN(this._childrenCount)) ? this._childrenCount : 0;
      return n;
    }
  }

  childrenCountArray(): Array<number> {
    let arr: number[] = new Array(this.childrenCount);
    for(let i=0; i<this.childrenCount; i++){
      arr[i] = i+1;
    }

    return arr;
  }

  set childrenCount(n:number) {
    n > 29 ? this._childrenCount = 0 : this._childrenCount = n;
    if(!this.childrenCount || (this.childrenCount < this.childWithDisabilityCount)){
      this.childWithDisabilityCount = 0;
    }
  }
//GET SET for the Child Care Expense count
  get claimedChildCareExpense_line214AsString():string{
    if(!this._claimedChildCareExpense_line214AsString){
      return null;
    } else {
     return this._claimedChildCareExpense_line214AsString;
    }
  }
  set claimedChildCareExpense_line214AsString(n:string){
    if(!_.isEmpty(n) && n !== null){
      let num = n.toString();
      let parsedNum = parseFloat(num.replace(',', ''));
      this._claimedChildCareExpense_line214 = parsedNum;
      this._claimedChildCareExpense_line214AsString = n;
    }
  }

  get claimedChildCareExpense_line214(){
    if(!!this._claimedChildCareExpense_line214 && !isNaN(this._claimedChildCareExpense_line214)){
      return parseFloat(this._claimedChildCareExpense_line214+ '');
    }else{
      return null;
    }
  }

  set claimedChildCareExpense_line214(n:number){
    if(!this.isEmptyString(n)){
      this._claimedChildCareExpense_line214 = n;
    }
  }
// End of GET SET for the Child Care Expense count
// GET SET for UCCBenefit
  get reportedUCCBenefit_line117AsString(): string{
    if(!this._reportedUCCBenefit_line117AsString){
      return null;
    } else {
      return this._reportedUCCBenefit_line117AsString;
    }
  }
  set reportedUCCBenefit_line117AsString(n:string){
    if(!_.isEmpty(n) && n !== null) {
      let num = n.toString();
      let parsedNum = parseFloat(num.replace(',', ''));
      this._reportedUCCBenefit_line117 = parsedNum;
      this._reportedUCCBenefit_line117AsString = n;
    }
  }
  get reportedUCCBenefit_line117(): number{
    if(!!this._reportedUCCBenefit_line117 && !isNaN(this._reportedUCCBenefit_line117)){
      return parseFloat(this._reportedUCCBenefit_line117+ '');
    }else{
      return null;
    }
  }

  set reportedUCCBenefit_line117(n:number){
    if(!this.isEmptyString(n)){
      this._reportedUCCBenefit_line117 = n;
    }    
  }
// End of GET SET for UCCBenefit
// GET SET for spouseDSPAmount_line125
  get spouseDSPAmount_line125AsString(): string{
    if(!this._spouseDSPAmount_line125AsString){
      return null;
    } else {
      return this._spouseDSPAmount_line125AsString;
    }
  }

  set spouseDSPAmount_line125AsString(n:string){
    if(!_.isEmpty(n) && n !== null) {
      let num = n.toString();
      let parsedNum = parseFloat(num.replace(',', ''));
      this._spouseDSPAmount_line125 = parsedNum;
      this._spouseDSPAmount_line125AsString = n;
    }
  }
  get spouseDSPAmount_line125(): number{
    if(!!this._spouseDSPAmount_line125 && !isNaN(this._spouseDSPAmount_line125)){
      return parseFloat(this._spouseDSPAmount_line125+ '');
    }else{
      return null;
    }
  }

  set spouseDSPAmount_line125(n:number){
    if (!this.isEmptyString(n)) {
      this._spouseDSPAmount_line125 = n;
    }
  }
// End of GET SET for spouseDSPAmount_line125
  get hasSpouseOrCommonLaw(){
    return this._hasSpouseOrCommonLaw;
  }

  set setSpouse(arg: boolean){
    if(!arg){
      this.spouseEligibleForDisabilityCredit = arg;
      this.spouseIncomeLine236 = undefined;
      this.spouseAgeOver65 = undefined;
    }
    this._hasSpouseOrCommonLaw = arg;
  }

  get selfDisabilityCredit(){
    return this.eligibleForDisabilityCredit;
  }
  set selfDisabilityCredit(selfEligible:boolean){
    this.eligibleForDisabilityCredit = selfEligible;
  }

  get spouseEligibleForDisabilityCredit(){
    return this.spouseOrCommonLawEligibleForDisabilityCredit
  }

  set spouseEligibleForDisabilityCredit(spouseEligible:boolean) {
    if(spouseEligible){
      this._hasSpouseOrCommonLaw = true;
    }
    this.spouseOrCommonLawEligibleForDisabilityCredit = spouseEligible;
  }

  // Address and Contact Info
  public residentialAddress: Address = new Address();
  public mailingSameAsResidentialAddress: boolean = true;
  public mailingAddress: Address = new Address();
  public phoneNumber: string;

  id:string;

  /**
   * Power of atterney docs and attendant care expense receipts
   */
  getAllImages():MspImage[] {
    return [...this.powerOfAttorneyDocs, ...this.attendantCareExpenseReceipts, ...this.assistYeaDocs];
  }

  /**
   * Filters out years not applied for
   * @returns {AssistanceYear[]}
   */
  getAppliedForTaxYears (): AssistanceYear[] {
    return this.assistYears.filter((value:AssistanceYear) => {
      return value.apply;
    });
  }

  /**
   * Sorts descending the applied for tax years
   */
  getMostRecentAppliedForTaxYears(): AssistanceYear[] {
    return this.getAppliedForTaxYears().sort((a:AssistanceYear, b:AssistanceYear) => {
      return a.year - b.year;
    })
  }

  /**
   * Determines what type of application this is based on tax years specified
   * @returns {AssistanceApplicationType}
   */
  getAssistanceApplicationType (): AssistanceApplicationType {
    let mostRecentAppliedForTaxYears = this.getMostRecentAppliedForTaxYears();

    if (mostRecentAppliedForTaxYears == null ||
      mostRecentAppliedForTaxYears.length < 1) {
      return AssistanceApplicationType.CurrentYear;
    }

    // If we only have one and it's last year
    if (mostRecentAppliedForTaxYears &&
      mostRecentAppliedForTaxYears.length === 1 &&
      mostRecentAppliedForTaxYears[0].year === moment().year() - 1) {
      return AssistanceApplicationType.PreviousTwoYears;
    }

    return AssistanceApplicationType.MultiYear;

  }

  /**
   * It ALWAYS returns most recent applied for year which is always this year
   * @returns {number}
   */
  getTaxYear():number {
    return moment().year();
  }

  /**
   * Counts the number of tax years
   * @returns {number}
   */
  numberOfTaxYears(): number {
    return this.getAppliedForTaxYears().length;
  }

  constructor(){
    this.id = UUID.UUID();
  }
  
}
