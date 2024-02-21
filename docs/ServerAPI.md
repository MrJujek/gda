# API Serwera

### GET /api/session

Ten endpoint sprawdza czy użytkownik jest zalogowany. Jeśli jest, zwraca jego
nazwę użytkownika, jeśli nie jest, zwraca "no session" i status *Unauthorized*.

### POST /api/session

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

### DELETE /api/session

Wysyłając zapytanie na ten endpoint użytkownik zostaje wylogowany, czyli jego
sesja zostaje usunięta.

### GET /api/users

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

## /api/my

Wszystkie endpointy w tej sekcji zwracają informacje o zalogowanym użytkowniku.
Jeśli sesja nie istnieje lub wygasła, to otrzymamy komunikat, że nie mamy 
dostępu do tych zasobów (status 401).

### GET /api/my/salt

Wysyłając zapytanie na ten endpoint dostajemy sól, słóżący do bardziej
bezpiecznego szyfrowania naszych wiadmości i klucza. Sól ma długość 16 bitów
i jest losowa dla każdego użytkownika. Jest wysyłana jako *text/plain*.

### GET /api/my/keys

Tutaj otrzymujemy klucze dla naszego użytkownika enkodowane z pomocą *base64*.
Są one w następującym formacie:

```json
{
    "PublicKey":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAETyRX...",
    "PassPrivateKey":"Q8FJjHgLotcZiWlshvZ5ndbq+gX6Fx0FSg4C+W5R...",
    "CodePirvateKey":"xF2Pwol5+8XEz+yXsfLw+MfKio16RfNWDAuuPHFY..."
}
```

### POST /api/my/keys

Tutaj przy pierwszym logowaniu ustawiamy klucze dla naszego użytkownika za 
pomocą json-a jak poniżej.

```json
{
    "PublicKey":"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAETyRX...",
    "PassPrivateKey":"Q8FJjHgLotcZiWlshvZ5ndbq+gX6Fx0FSg4C+W5R...",
    "CodePirvateKey":"xF2Pwol5+8XEz+yXsfLw+MfKio16RfNWDAuuPHFY..."
}
```
