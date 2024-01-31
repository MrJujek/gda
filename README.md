# _i512
Zapraszamy do zapoznania się z rozwiązaniem zadania problemowego przez zespół _i512 z Technikum Łączności nr. 14 w Krakowie. Wykonali: Paweł Pasternak, Julian Dworzycki i Jakub Owoc.

# GDA

Nasze rozwiązanie składa się z dwóch części. Serwera napisanego
w [Go](https://go.dev/), który wykorzystuje bazę danych
[PostgreSQL](https://www.postgresql.org/) oraz klienta, który jest
[PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps).

## Uruchomienie całości

Najłatwiejszym sposobem na skompilowanie i uruchomienie wszystkich serwisów,
bazy danych, itd. jest wykorzystanie [Docker-a](https://www.docker.com), czyli
oprogramowania służącego do konteneryzacji. Dzięki niemu będziemy w stanie
zrobić to wszystko używając poniższego polecenie w folderze repozytorium.

```sh
docker compose up
```

Zanim to jednak zrobimy należy uzupełnić plik `.env` lub wyeksportować
odpowiednie zmienne środowiskowe, które są podane poniżej w tabeli.

| Zmienna Środowiskowa | Opis                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| DB_NAME              | (WYMAGANE) Nazwa bazy danych, w której przechowywane będą wiadomości i inne dane serwera |
| DB_USER              | (WYMAGANE) Nazwa użytkownika administrującego bazą danych                                |
| DB_PASS              | (WYMAGANE) Hasło wyżej wspomnianego użytkownika                                          |
| DB_HOST              | Adres bazy danych PostgreSQL (IP/DNS)                                                    |
| DB_PORT              | Port na którym działa baza danych                                                        |
| LDAP_URL             | (WYMAGANE) URL do serwera LDAP, np: `ldap://127.0.0.1:398`, `ldap.local`                 |
| LDAP_USER_DN         | (WYMAGANE) DN użytkownika z prawami do odczytu w LDAP                                    |
| LDAP_PASS            | (WYMAGANE) Hasło wyżej wspomnianego użytkownika                                          |
| LDAP_BASE_DN         | (WYMAGANE) BASE DN serwera LDAP                                                          |
| SESSION_KEY          | (WYMAGANE) Klucz (tekst) używany do szyfrowania sesji użytkowników w bazie danych        |

## Środowisko deweloperskie

Więcej o ustawianiu środowiska deweloperskiego znajduje się [tutaj](./docs/DevEnvironment.md).

## Serwer

Kod źródłowy serwera znajduje się w folderze `server`.

### Kompilacja

Aby skompilować kod serwera należy wcześniej zainstalować zestaw narzędzi `go`.
Informacje o tym jak go zainstalować znajduje się na stronie
[go.dev](https://go.dev/doc/install). Jeżeli nie chcemy go instalować, możemy
wykorzystać `docker-a` i opis w kolejnym punkcie.

Kiedy mamy już zainstalowany program `go`, wystarczy że użyjemy poniższego
polecenia znajdując się w folderze `server`.

```sh
go build .
```

### Budowa kontenera

Jeżeli nie chcemy instalować pakietu `go`, a mamy już zainstalowanego `docker-a`
to możemy go użyć żeby zbudować kontener używając poniższego polecenia.
Następnie używając polecenia `docker run` możemy uruchomić nasz serwer.

```sh
docker build .
```

## Klient

Kod źródłowy aplikacji klienckiej znajduje się w folderze `frontend`.

### Instalacja i kompilacja

Należy wejść do folderu `frontend` i zainstalować paczki za pomocą komendy:
```sh
yarn
```
Następnie kompilujemy aplikację wpisując:
```sh
yarn build
```
