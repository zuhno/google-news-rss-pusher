export class FeedsQueryDto {
  readonly lastKey: number;
  readonly limit: number;
  readonly categoryId: number;
}

export class FeedsLimitedAllQueryDto {
  readonly limit: number;
}
