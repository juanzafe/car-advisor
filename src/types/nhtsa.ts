export interface NhtsaModel {
  Make_Name: string;
  Model_Name: string;
  Model_ID: number;
}

export interface NhtsaResponse {
  Results: NhtsaModel[];
}
