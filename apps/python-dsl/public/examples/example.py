# Example of projections puts, increment (++), times

counter = 0
print(f"Counter is initially {counter}")

n_rounds = 10
for index in range(n_rounds):
    counter += 1
    print("Counter is now: ", end="")
    print(counter)


# Monte Carlo estimation of Pi
from random import random

inside = 0
N = 100000

for idx in range(N):
    x, y = random(), random()
    if x**2 + y**2 < 1:
        inside += 1

print("Pi is roughly: ", end="")
print(inside / N * 4)


# Example with dls for tables and variables
from dsl import db

old_pattern = "Mister"
new_pattern = "Mr."

with db.change("students") as table:
    table.column("firstName").replace("Mister", "Mr.")
    table.column("secondName").trim("right")
    table.column("firstName").replace(old_pattern, new_pattern)


def x(input, name):
    print("Hello world!")
    if True:
        while 2 < 1:
            with db.change("lectures") as table:
                table.column("lecturer").replace("<target>", "<value>")
                table.column("name").trim("both")


with db.change("students") as table:
    table.column("firstName").replace("Mister", "Mr.")
    table.column("secondName").trim("right")
