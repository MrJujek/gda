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

### GET /api/chat

Wysyłając takie zapytanie, serwer wyśle odpowiedź z próbą zmiany połączenia
na takie, które wykorzystuje protokół websockets. Więcej na ten temat znajduje
się w sekcji o websocketach.

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

### GET /api/chat/messages?chat=\<uuid>&last-message=\<integer>

Aby otrzymać listę 100 wiadomości dla konkretnych czatów, wysyłamy zapytanie
z parametrami `chat` ustawionym jako uuid czatu, którego wiadomości chcemy
wyświetlić, oraz opcjonalnie `last-message` ustawionym jako id ostatniej
wiadomości.

Przykładowa odpowiedź:

```json
[
  {
    "Id": 1,
    "AuthorId": 1,
    "Timestamp": "2024-02-25T18:12:39.703703Z",
    "MsgType": "text",
    "Encrypted": false,
    "Text": "Cześć",
    "FileUUID": null
  },
  {
    "Id": 2,
    "AuthorId": 1,
    "Timestamp": "2024-02-25T18:13:49.271953Z",
    "MsgType": "text",
    "Encrypted": false,
    "Text": "Czy widzisz tą wiadomość?",
    "FileUUID": null
  },
  {
    "Id": 3,
    "AuthorId": 3,
    "Timestamp": "2024-02-25T18:14:32.045781Z",
    "MsgType": "text",
    "Encrypted": false,
    "Text": "Tak widzę",
    "FileUUID": null
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

## /api/file

Endpoint służący do zapisywania i pobierania plików.

### GET /api/file?uuid=\<uuid>

Wysyłając takie zapytanie z uuid pliku, który chcemy pobrać lub wyświetlić,
serwer sprawdza czy jesteśmy w czacie, na który został wysłany ten plik i czy
w ogóle istnieje. Jeśli istnieje i mamy do niego dostęp to zwraca nam plik,
jeśli nie otrzymujemy odpowiedni status i komunikat.

### POST /api/file

Wysyłając zapytanie w formacie (Content-Type) `multipart/form-data` na ten
endpoint możemy dodać plik do czatu. Zwraca on uuid pliku, za pomocą którego
możemy później pobrać lub wyświetlić taki plik.

FormData ma tutaj dwa pola: `file` i `chat-uuid`. Musimy wypełnić je oba.
Przykładowe zapytanie powinno wyglądać jak poniżej.

```multipart/form-data
--boundary
Content-Disposition: form-data; name="file"; filename="obrazek.jpg"
Content-Type: image/jpeg

dane pliku...
--boundary
Content-Disposition: form-data; name="chat-uuid"

888341a2-2a48-4a65-a135-75db615ec4ba
--boundary--
```

Przykładowa odpowiedź:

```text/plain
75f47e34-4cc8-4e2e-8d6e-2b69d28dc8a9
```

## WebSockety

Ta sekcja pokazuje jak można wykorzystać api serwera wykorzystując websockety. 
Aby uzyskać połączenie w przeglądarce możemy użyć kodu poniżej.

```js
    const socket = new WebSocket(`ws://${host}:${port}/api/chat`)
```

### wysyłanie wiadomości 

Aby wysłać wiadomość do jakiegoś czatu możemy wysłać poniższy tekst do serwera.

```json
{
    "Type": "message",
    "Data": {
        "ChatUUID": "2c43007e-cec2-4cc7-bc45-3860264e7480",
        "Text": "test",
        "MsgType": "text",
        "Encrypted": false
    }
}
```
```json
{
    "Type": "message",
    "Data": {
        "ChatUUID": "2c43007e-cec2-4cc7-bc45-3860264e7480",
        "FileUUID": "1a423074-cec2-4cc7-bc45-3860264e7480",
        "MsgType": "text",
        "Encrypted": false
    }
}
```

Wiadomości mogą być różnego typu, np.:
- text - wiadomości, które wykorzystują jedynie pole tekstu.
- image - wiadomości, które wykorzystują pole FileUUID zamiast pola Text i służą do wysyłania zdjęć i obrazków,
- file - wiadomości, które wykorzystują pole FileUUID zamiast pola Text i służa do wysyłania innych plików niż zdjęcia.

