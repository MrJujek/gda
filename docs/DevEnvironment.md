# Ustawianie środowiska deweloperskiego

## Instalacja wymaganego oprogramowania

Do kompilacji i pracy nad oprogramowaniem zawartym w tym repozytorium
potrzebujemy następującego oprogramowania:

### Git

Jeżeli jeszcze nie pobrałeś kodu źródłowego, to zalecamy aby zrobić to za
pomocą git-a. Jest to system do kontroli wersji kodu, który bardzo ułatwia nam
pracę. Można go pobrać [tutaj](https://git-scm.com/downloads).

Proces klonowanie repozytorium jest opisany w następnej części.

### Docker

Kontenerów używamy do ustawienia bazy danych i innych serwisów potrzebnych do
sprawdzenia czy nasz program działa prawidłowo lub pomocnych przy manipulacji
danymi. Mamy dwie możliwości instalacji Docker-a.

Pierwszą z nich jest zainstalowanie programu
[Docker Desktop](https://docs.docker.com/desktop/), który możemy pobrać
[tutaj](https://www.docker.com/get-started/). Posiada on prosty w użyciu
interfejs graficzny. Polecamy go zwłaszcza osobą, które nie miały dużej
styczności z konteneryzacją.

Drugą opcją jest skorzystanie z
[Docker Engine](https://docs.docker.com/engine/). Oprogramowanie to nie posiada
interfejsu graficznego. Korzysta się z niego za pomocą lini komend. To
rozwiązanie polecamy osobom, które chcą żeby ich środowisko deweloperskie jak
najbardziej przypominało to, które będzie się znajdowało na serwerze. Więcej
o jego instalacji przeczytacie [tutaj](https://docs.docker.com/engine/install/).

### Go

Jeżeli chcemy zająć się kodem serwera, to powinniśmy zainstalować program `go`,
który służy zarządzaniu paczkami, formatowaniem kodu, kompilowaniem go, itd.
Aby go zainstalować należy wejść na stronę [go.dev](https://go.dev/doc/install)
i postępować według instrukcji.


### Yarn

<!-- TODO -->

## Klonowanie repozytorium

Aby sklonować repozytorium na naszą maszynę należy w wybranym folderze użyć
polecenia:

```sh
git clone https://github.com/MrJujek/gda.git
```

## Plik `.env` i `docker-compose.yaml`

Zanim uruchomimy nasze środowisko deweloperskie musimy jeszcze utworzyć
i uzupełnić plik `.env`. Plik ten uzupełniamy w następujący sposób:

```sh
DB_USER=nazwa_uzytkownika_bazy_danych
DB_PASS=haslo_uzytkownika_bazy_danych
DB_NAME=nazwa_bazy_danych
LDAP_USER=nazwa_uzytkownika_readonly_w_ldap
LDAP_PASS=haslo_uzytkownika_w_ldap
LDAP_BASE_DN=dc=demo,dc=org
LDAP_USER_DN=cn=$LDAP_USER,$LDAP_BASE_DN
LDAP_URL=ldap://127.0.0.1:389
```

Należy też odkomentować fragmenty w pliku `docker-compose.yaml` poprzedzone
komentarzem:
```yaml
### DEV ONLY!!!
```

## Uruchomienie środowiska

Jesteśmy teraz gotowi, aby uruchomić nasze środowisko deweloperskie. Wystarczy,
że wpiszemy teraz w terminal następujące polecenie:

```sh
docker compose up
```

Aby je zamknąć należy wcisnąć `Ctrl-C`. A później użyć polecenia

```sh
docker compose down
```

