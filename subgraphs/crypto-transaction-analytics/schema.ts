import { parse } from "graphql";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = parse(`
  type Query {
    _empty: String
  }
`);
