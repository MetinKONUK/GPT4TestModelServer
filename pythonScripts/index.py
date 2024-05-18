import ast
import sys
import json


class AssertionVisitor(ast.NodeVisitor):
    def __init__(self):
        self.assertions = 0

    def visit_Call(self, node):
        # Check for assertion calls
        if isinstance(node.func, ast.Attribute):
            if "assert" in node.func.attr:
                self.assertions += 1


class UniqueVarVisitor(ast.NodeVisitor):
    def __init__(self):
        self.unique_vars = set()

    def visit_Name(self, node):
        self.unique_vars.add(node.id)


class UniqueParamVisitor(ast.NodeVisitor):
    def __init__(self):
        self.unique_params = set()

    def visit_FunctionDef(self, node):
        self.unique_params.update(arg.arg for arg in node.args.args)


def main(code):
    tree = ast.parse(code)
    assertion_visitor = AssertionVisitor()
    var_visitor = UniqueVarVisitor()
    param_visitor = UniqueParamVisitor()

    assertion_visitor.visit(tree)
    var_visitor.visit(tree)
    param_visitor.visit(tree)
    return (
        assertion_visitor.assertions,
        len(var_visitor.unique_vars),
        len(param_visitor.unique_params),
    )


if __name__ == "__main__":
    code = sys.argv[1]
    assertionCount, unique_vars_count, unique_params_count = main(code)
    print(f"{assertionCount},{unique_vars_count}, {unique_params_count},{len(code)}")
