export class FeedsQueryDto {
  readonly lastKey?: string;
  readonly limit: number;
  readonly categoryId: number;
}

export class FeedsLimitedAllQueryDto {
  readonly limit: number;
}
