from typing import Callable, Sequence, TypeVar
from openpyxl.workbook import Workbook
from openpyxl.worksheet.worksheet import Worksheet
from openpyxl.cell import Cell
import openpyxl

T = TypeVar("T")


def unzip(seq: Sequence[Sequence[T]]) -> Sequence[Sequence[T]]:
    return zip(*seq)


class Sheet(object):
    def __init__(self, inner: Worksheet):
        self.inner = inner

    def take(
        self, sheet_range: str, filter: Callable[..., bool]
    ) -> Sequence[Sequence[Cell]]:
        return unzip(
            row
            for row in self.inner[sheet_range]
            if filter(*(cell.value for cell in row))
        )

    def join(
        self,
        sheet_range: str,
        join_on: Sequence[Cell],
        key: Callable,
        aggregation: Callable,
    ) -> Sequence[Sequence[Cell]]:
        return unzip(
            aggregation(
                (row for row in self.inner[sheet_range]),
                key=lambda row: key(*[cell.value for cell in row], join_cell.value),
            )
            for join_cell in join_on
        )


class SheetBlock(object):
    def __init__(self, sheet: Worksheet):
        self.sheet = sheet

    def __enter__(self):
        return Sheet(self.sheet)

    def __exit__(self, *args):
        pass


def load_sheet(file_name: str, sheet_name: str) -> SheetBlock:
    workbook = openpyxl.load_workbook(file_name)
    sheet = workbook[sheet_name]
    return SheetBlock(sheet)


def create_workbook(sheet_name: str, columns: Sequence[Sequence[Cell]]) -> Workbook:
    workbook = Workbook()
    sheet = workbook.create_sheet(sheet_name, 0)
    values = [[cell.value for cell in column] for column in columns]
    rows = zip(*values)
    for row in rows:
        sheet.append(row)
    return workbook


def store_sheet(file_name: str, sheet_name: str, columns: Sequence[Sequence[Cell]]):
    workbook = create_workbook(sheet_name, columns)
    workbook.save(file_name)


def display(**columns: dict[Sequence[Cell]]):
    from pandas import DataFrame
    from IPython.display import display

    df = DataFrame({key: [cell.value for cell in columns[key]] for key in columns})
    display(df)
