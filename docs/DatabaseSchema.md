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
    chats {
        uuid        chat_uuid
        boolean     encrypted
        boolean     group
        text        group_name
        timestamp   last_message
    }
    users_chats {
        uuid    chat_uuid
        integer user_id
        text    enc_secret
    }
    "messages_[chats.uuid]" {
        serial      id
        integer     author_id
        timestamp   timestamp
        msg_type    type
        boolean     encrypted
        text        message
        uuid        file_uuid
    }
    sessions 1+--1 users : ""
    users_chats 1+--1+ users : ""
    users_chats 1+--1+ chats : ""
    chats 1--1 "messages_[chats.uuid]": ""
```
