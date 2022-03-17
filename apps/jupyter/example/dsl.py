class Column(object):
    def __init__(self, tableName, columnName):
        self.tableName = tableName
        self.columnName = columnName

    def replace(self, target, replacement):
        print(f"UPDATE {self.tableName} SET {self.columnName} = REPLACE({self.columnName}, {repr(target)}, {repr(replacement)})")

    def trim(self, direction):
        command = "TRIM"
        if direction == "left":
            command = "LTRIM"
        elif direction == "right":
            command = "RTRIM"
        print(f"UPDATE {self.tableName} SET {self.columnName} = {command}({self.tableName})")

class Table(object):
    def __init__(self, tableName):
        self.tableName = tableName

    def column(self, columnName):
        return Column(self.tableName, columnName)

class ChangeBlock(object):
    def __init__(self, tableName):
        self.tableName = tableName

    def __enter__(self):
        return Table(self.tableName)

    def __exit__(self, *args):
        pass

class Database(object):
    def __init__(self):
        pass

    def change(self, tableName):
        return ChangeBlock(tableName)

db = Database()
