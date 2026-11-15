# Workflow diagrams — proposed integration

ทั้ง 6 แผนภาพใช้ Admin, Frontend, Backend API และ Database แยกกัน Backend/Database ยัง Not Verified; UI ปัจจุบันเรียก Mock adapter ในหน่วยความจำแทน เปิดภาพพร้อมสีและแบบพิมพ์ได้ที่ `workflow.html`

## Authentication

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    A->>F: Username + Password
    F->>F: Validate and loading
    F->>B: auth/login (schema pending)
    B->>D: Verify account via actual mechanism
    D-->>B: Account status
    alt Invalid / disabled
      B-->>F: Safe error
      F-->>A: Correct input and retry
    else Authenticated
      B-->>F: Session contract
      F->>B: auth/me
      B-->>F: Permissions and temporary status
      F-->>A: Change password if required, then authorized page
    end
```

## Dashboard data

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    A->>F: Open Overview
    F->>B: Read allowed dashboard data
    B->>B: Authenticate and authorize
    B->>D: Read scoped data
    D-->>B: Activity records
    B-->>F: Safe summary/results/events
    alt Data exists
      F-->>A: Metrics, chart, tables from same dataset
    else Empty
      F-->>A: Empty state
    else Error
      F-->>A: Error + Retry
    end
```

## Search and filter

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    A->>F: Search / status / date
    F->>F: Cancel or ignore stale request
    F->>B: Allowed query (contract pending)
    B->>B: Check permissions and filters
    B->>D: Query permitted records
    D-->>B: Records + pagination
    B-->>F: Response
    F->>F: Accept only latest request
    F-->>A: Results / empty / error
```

## Create, update and delete

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    A->>F: Edit form / select target
    F-->>A: Validation + confirmation
    alt Cancel
      F-->>A: Preserve existing record
    else Confirm
      F->>B: Mutation (no automatic retry)
      B->>B: Permission, validation, concurrency
      B->>D: Persist and audit per policy
      D-->>B: Confirmed result
      B-->>F: Success / safe error
      F-->>A: Reload or preserve draft
    end
```

## Permissions

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    A->>F: Select staff / role / permissions
    F-->>A: Matrix and impact confirmation
    A->>F: Confirm
    F->>B: Change role (endpoint pending)
    B->>B: Enforce authority and account policies
    B->>D: Persist role + audit
    D-->>B: Result
    B-->>F: New permissions / error
    F-->>A: Reload authorized navigation
```

## Logout and session expiry

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    A->>F: Logout
    F-->>A: Confirm discard if draft exists
    F->>B: End/revoke session (contract pending)
    B->>D: Revoke persisted session if applicable
    D-->>B: Result
    B-->>F: Confirmed logout
    F->>F: Cancel pending requests, clear view/state
    F-->>A: Login
    Note over F,B: Expired session: server denies access; client clears data and returns to Login
```
