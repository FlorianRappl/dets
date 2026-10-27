export interface CRS {
  scale(zoom: number): number;
}

export declare namespace CRS {
  const Earth: CRS;
}
