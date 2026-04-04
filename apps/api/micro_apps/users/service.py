"""
Users service — business logic only.
Constitution: CLAUDE.md #8, #16, #19

Copilot direction — implement all functions in Session 4:

list_users(db, role?, is_active?, page, page_size) -> (List[UserRead], int)
  Pure pass-through to repository + schema conversion.

create_user(db, payload: UserCreate) -> UserRead
  Rule 1: username unique -> AUTH_001
  Rule 2: email unique -> AUTH_002
  Rule 3: hash password before persisting
  Flow: check_unique -> hash -> create -> return UserRead

get_user(db, user_id: UUID) -> UserRead
  Fetch by ID. Raise USER_001 (404) if not found.

update_user(db, user_id, payload: UserUpdate, requesting_user: User) -> UserRead
  Guard: admin cannot demote own role -> RBAC_002 (400)
  Apply only fields present in payload (exclude_unset=True)

deactivate_user(db, user_id, requesting_user: User) -> None
  Guard: admin cannot deactivate themselves -> 400
  Flow: fetch -> self-guard -> deactivate
"""
# TODO(session-4): Implement all functions per direction above.
# Imports needed: users.repository, auth.repository (for uniqueness check),
#                 security.hash_password, UserRead schema, AppError, ErrorCode
