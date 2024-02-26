package controller

import (
	"net/http"
	db "server/db_wrapper"
	ldap "server/ldap_wrapper"
	"strconv"
)

func userPhoto(w http.ResponseWriter, r *http.Request) {
	ok, _ := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	userIdStr := r.FormValue("user-id")
	if userIdStr == "" {
		http.Error(w, "You didn't provide valid user-id", http.StatusBadRequest)
		return
	}
	userId, err := strconv.ParseUint(userIdStr, 10, 32)
	if err != nil {
		http.Error(w, "You didn't provide valid user-id. It has to be a number", http.StatusBadRequest)
		return
	}

	user, err := db.GetUserById(uint32(userId))
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	image, err := ldap.UserImage(user.LDAP_DN)
	if err != nil {
		http.Error(w, "Error during photo retrival", http.StatusInternalServerError)
		return
	}

	if len(image) == 0 {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("This user doesn't have a photo"))
		return
	}

	w.Write(image)
}
