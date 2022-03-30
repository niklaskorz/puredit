import puredit.dsl as dsl

# load sheet "raw data " from "Raw data Chromatography.xlsx":
with dsl.load_sheet("Raw data Chromatography.xlsx", "raw data ") as sheet:
    # take K, L from K4:L35 where isinstance(L, int)
    K, L = sheet.take("K4:L35", "isinstance(L, int)")
    # join A, B from A4:B46704 on K where abs(K - A) is minimal
    A, B = sheet.join("A4:B46704", K, "abs(K - A)", dsl.AggregationMethod["minimal"])
    # store K, L, B in sheet "output" of "output.xlsx"
    dsl.store_sheet("output.xlsx", "output", [K, L, B])
    # display K, L, B
    dsl.display([K, L, B])
