import sympy
import latex2sympy


def compile(latex):
    symbolic = latex2sympy.latex2sympy(latex)
    simplified = sympy.simplify(symbolic)
    args = tuple(simplified.free_symbols)
    return sympy.lambdify(args, simplified, "numpy"), args


def evaluate(latex, scope):
    f, args = compile(latex)
    return f(**{symbol.name: scope[symbol.name] for symbol in args})
