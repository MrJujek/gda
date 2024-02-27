# _i512

Zapraszamy do zapoznania się z rozwiązaniem zadania problemowego przez zespół
_i512 z Technikum Łączności nr. 14 w Krakowie.

Wykonali: Paweł Pasternak, Julian Dworzycki i Jakub Owoc.

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

| Zmienna Środowiskowa | Opis                                                                                                                                                                       |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DB_NAME              | (WYMAGANE) Nazwa bazy danych, w której przechowywane będą wiadomości i inne dane serwera                                                                                   |
| DB_USER              | (WYMAGANE) Nazwa użytkownika administrującego bazą danych                                                                                                                  |
| DB_PASS              | (WYMAGANE) Hasło wyżej wspomnianego użytkownika                                                                                                                            |
| DB_HOST              | Adres bazy danych PostgreSQL (IP/DNS)                                                                                                                                      |
| DB_PORT              | Port na którym działa baza danych                                                                                                                                          |
| LDAP_URL             | (WYMAGANE) URL do serwera LDAP, np: `ldap://127.0.0.1:398`, `ldap.local`                                                                                                   |
| LDAP_USER_DN         | (WYMAGANE) DN użytkownika z prawami do odczytu w LDAP                                                                                                                      |
| LDAP_PASS            | (WYMAGANE) Hasło wyżej wspomnianego użytkownika                                                                                                                            |
| LDAP_BASE_DN         | (WYMAGANE) BASE DN serwera LDAP                                                                                                                                            |
| LDAP_USER_FILTER     | Filtr, który służy do wyszukiwania użytkowników w LDAP/AD. Przykładowy filtr: `(&(objectClass=organizationalPerson)(uid=%username%))`. Więcej o filtrach w opisie poniżej. |
| LDAP_IMAGE_ATTR      | Atrybut, którego wartością jest zdjęcie użytkownika. Domyślnie: `jpegPhoto`.                                                                                               |
| UPDATE_INTERVAL      | Liczba minut po której następuje aktualizacja danych o użytkownika z LDAP/AD. Domyślnie 5 minut.                                                                           |
| GDA_PORT             | Port na którym zostanie uruchomiony serwer http aplikacji. Domyślnie 80.                                                                                                   |
| GDA_SECURE_SERVER    | Opcja od której zależy czy zostanie włączony serwer https, a zapytania http zostaną przekierowane na https. Domyślnie 0, aby włączyć należy ustawić jako 1.                |
| GDA_SECURE_PORT      | Port na którym zostanie uruchomiony serwer https aplikacji. Domyślnie 443.                                                                                                 |
| GDA_CERT_PATH        | Ścieżka gdzie znajduje się certyfikat tls służący do zabezpieczenia serwera. Domyślnie `./config/server.crt`.                                                              |
| GDA_KEY_PATH         | Ścieżka gdzie znajduje się klucz do certyfikatu tls służący do zabezpieczenia serwera. Domyślnie `./config/server.key`.                                                    |
<!-- | SESSION_KEY          | (WYMAGANE) Klucz (tekst) używany do szyfrowania sesji użytkowników w bazie danych                                                                                          | -->

### Konfiguracja HTTPS

<!-- in future automate this process in app -->
Aby zabezpieczyć nasz serwer wykorzystujemy self signed certificate, który
umieszczamy w folderze `config`. Taki certyfikat możemy wygenerować za pomocą
następujących poleceń.

```sh
openssl req -x509 -newkey ec:<(openssl ecparam -name prime256v1) -keyout server.key -out server.crt -days 365
```

Jeżeli chcemy by jego długość była inna, należy zmienić 365 na oczekiwaną liczbe
dni.


## Kopia zapasowa, migracje, itp. 

Wszystkie dane, na których operuje ta aplikacja znajdują się w dockerowych
volumach, folderach `config` (o ile korzystamy z https) oraz w plikach
`docker-compose.yaml` i `.env` (o ile w ogóle go używamy). Kopiując to wszystko
możemy przenieść naszą aplikację na dowolny inny system z dockerem lub stworzyć
kopię zapasową. Aby uruchomić nasz serwer z tą konfiguracją, plikami, kwerendami 
z bazy danych, wystarczy użyć poniższego polecenia, tak jak przy zwykłym starcie
aplikacji.

```sh
docker compose up
# lub aby uruchomiło się w tle: docker compose up -d
```

Jest też cyklicznie wykonywana kopia zapasowa do folderu `backup`. Są tam
zapisywane stany bazy danych z każdego dnia oraz pliki i certyfikaty.
W przypadku utraty danych w folderach `config`, `data` i `db_data` możemy się
posłużyć poniższym poleceniem żeby przywrócić kopię z danego dnia.

```sh
docker exec gda-backup-1 /restore.sh <YYYY-MM-DD>
```

gdzie `YYYY-MM-DD` to następująco rok, miesiąc i dzień backup-u. Możemy też
wykonać kopię na żądanie:

```sh
docker exec gda-backup-1 /backup.sh
```

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

