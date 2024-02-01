# API Serwera

## GET /api/session

Ten endpoint sprawdza czy użytkownik jest zalogowany. Jeśli jest, zwraca jego
nazwę użytkownika, jeśli nie jest, zwraca "no session" i status *Unauthorized*.

## POST /api/session

Wysyłając na ten endpoint nazwę użytkownika i hasło w formacie jak poniżej,
otrzymujemy ciasteczko sesji, o ile możemy zalogować się takimi danymi do usługi
katalogowej (LDAP/AD). Jeżeli nie jesteśmy w stanie się zalogować, otrzymamy
stosowny komunika i status.

```json
{
    "user": "nazwa użytkownika",
    "password": "hasło użytkownika",
}
```

## DELETE /api/session

Wysyłając zapytanie na ten endpoint użytkownik zostaje wylogowany, czyli jego
sesja zostaje usunięta.

## GET /api/users

Wysyłając zapytanie na ten endpoint, otrzymamy listę użytkowników w formacie
jak poniżej, o ile jesteśmy zalogowani.

```json
[
    {
        "ID": 1,
        "CommonName": "nazwa użytkownika",
        "DisplayName": {
            "String": "nazwa użytkownika przeznaczona do wyświetlenia",
            "Valid": true
        },
        "Active": false
    },
    {
        "ID": 2,
        "CommonName": "nazwa innego użytkownika",
        "DisplayName": {
            "String": "",
            "Valid": false 
        },
        "Active": true
    }
]
```

