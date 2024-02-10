# Diagram relacji w bazie danych

**Czyli inaczej diagram związków encji.**

```mermaid
erDiagram
    users {
        serial  id
        text    ldap_dn
        text    common_name
        text    display_name
        bytea   img
        boolean active
        boolean deleted
        text    pub_key
        text    pass_enc_priv_key
        text    code_enc_priv_key
    }
    sessions {
        uuid        session_uuid
        integer     user_id
        timestamp   created_at
        timestamp   exipres_at 
    }
    sessions 1+--1 users : ""
```
