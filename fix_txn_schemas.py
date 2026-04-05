import re

with open('apps/api/micro_apps/transactions/schemas.py', 'r') as f:
    content = f.read()

validator_code = '''
    @field_validator("category")
    @classmethod
    def category_not_empty_if_set(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Category cannot be empty")
        return v
'''

if "category_not_empty_if_set" not in content:
    content = content.replace(
        "return round(v, 2) if v is not None else v",
        "return round(v, 2) if v is not None else v\n" + validator_code
    )
    with open('apps/api/micro_apps/transactions/schemas.py', 'w') as f:
        f.write(content)
