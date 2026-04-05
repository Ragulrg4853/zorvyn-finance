import os

test_users = 'c:/Users/girit/OneDrive/Documents/zorvyn-fintech/zorvyn-finance/zorvyn-finance/apps/api/micro_apps/users/tests/test_service.py'
test_roles = 'c:/Users/girit/OneDrive/Documents/zorvyn-fintech/zorvyn-finance/zorvyn-finance/apps/api/micro_apps/roles/tests/test_service.py'

if os.path.exists(test_users): os.remove(test_users)
if os.path.exists(test_roles): os.remove(test_roles)
