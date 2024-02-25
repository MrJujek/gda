# API Serwera

## /api/session

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

## /api/chat

Ten endpoint służy do tworzenia i korzystania z czatów. Jeżeli użytkownik nie
jest zalogowany zostanie zwrócony odpowiedni błąd.

### POST /api/chat

Wysyłając rządanie pod ten url możemy stworzyć czat 1-na-1 lub konwersację
grupową. Format zapytania aby utworzyć grupę:

```json
{
    "UserIds": [1, 2, 3, 4],
    "Group": true,
    "GroupName": "group name :)"
}
```

i aby utworzyć konwersację 1-na-1:

```json
{
    "UserIds": [1, 2]
}
```

lub

```json
{
    "UserIds": [2]
}
```

Dla grup lista użytkowników musi być większa niż 2, a nazwa nie może być
długości 0. Natomiast dla konwersacji bezpośrednich liczba użytkowników musi
być równa 2. W innym przypadku otrzymamy błąd. Nie trzeba podawać użytkownika,
który tworzy czat. Jest on dodawany automatycznie.

### GET /api/chat/messages?chat=<uuid>&last-message=<integer>

Aby otrzymać listę 100 wiadomości dla konkretnych czatów, wysyłamy zapytanie
z parametrami `chat` ustawionym jako uuid czatu, którego wiadomości chcemy
wyświetlić, oraz opcjonalnie `last-message` ustawionym jako id ostatniej
wiadomości.


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

### GET /api/my/chats

Ten endpoint zwraca nam listę konwersacji zalogowanego użytkownika w poniższym
formacie.

```json
[
    {
        "ChatUUID": "88565776-8f0c-4455-9a4a-e18c2a8cb212",
        "Encrypted": true,
        "Group": false,
        "GroupName": {
            "String": "",
            "Valid": false
        }
    },
    {
        "ChatUUID": "b9522a42-0d59-4e58-bc59-ce0c0b2f9f25",
        "Encrypted": false,
        "Group": true,
        "GroupName": {
            "String": "group-chat-name",
            "Valid": true
        }
    }
]
```
