import { scanCode } from "./code.js";
import { scanProjections } from "./projections.js";

export {};

const code = [
  'table["name"] = table["name"].replace("Mister", "Mr.");',
  'table["title"] = table["title"].replace("Doctor", "Dr.");',
  'table["address"] = table["address"].replace("Road", "Rd.");',
];

const projections = [
  "replace Mister Anderson with Mr. in column name",
  "replace Doctor with Dr. Andrews in column title",
  "replace Road with Rd. in column address",
];

console.log(scanProjections(projections));

console.dir(scanCode(code), { depth: 20 });
