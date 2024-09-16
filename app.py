from flask import Flask, render_template, request, session, url_for, redirect
from database import get_db, close_db, g
from forms import LoginForm, RegistrationForm
from functools import wraps
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash

import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()
load_dotenv(".flaskenv")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('login', next=request.url))
        return view(*args, **kwargs)
    return wrapped_view


@app.before_request
def load_logged_in_user():
    g.user = session.get("user_id", None)
    
app.teardown_appcontext(close_db)

methods = ["GET", "POST"]

@app.route("/")
def index():

    db = get_db()
    leaderboard = db.execute(""" SELECT * FROM wave_leaderboard ORDER BY waveCount DESC LIMIT 10;""").fetchall()


    return render_template("index.html", leaderboard=leaderboard) 


@app.route("/endless")
@login_required
def endless():

    return render_template("endless.html")


@app.route("/bossrun")
def bossrun():
    return render_template("bossrun.html")


@app.route("/registration", methods = ["GET", "POST"])
def registration():
    form = RegistrationForm()
    if form.validate_on_submit():
        user_id = form.user_id.data
        password = form.password.data
        password2 = form.password2.data
        db = get_db()
        conflict_user = db.execute(''' SELECT * FROM users
               WHERE user_id = ?''', (user_id,)).fetchone() 

        if conflict_user is not None:
            form.user_id.errors.append("User clashes with another")
        else:
            db.execute(''' INSERT INTO users (user_id, password)
                        VALUES (?, ?);''', (user_id, generate_password_hash(password)))
                

            db.commit() 
            return redirect(url_for("login"))
    return render_template("registration.html", form=form)



@app.route("/login", methods=methods)
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user_id = form.user_id.data
        password = form.password.data
        db = get_db()

        user = db.execute(''' SELECT * FROM users
               WHERE user_id = ?''', (user_id,)).fetchone() #if only fetching a single piece of data, use fetchone, which returns one dictionary
        # if there is one (not None):
        if user is None:
            form.user_id.errors.append("No user with that username!")
            #  (encrypted, plain text)
        elif not check_password_hash(user['password'], password):
            form.password.errors.append("Incorrect password.")
        else:
            session.clear()
            session["user_id"] = user_id # puts user id into the session store so that when your user_id is in the store, you are logged in
            next_page = request.args.get("next")
            if not next_page:
                next_page = url_for('index')
            return redirect(next_page)
    return render_template("login.html", form=form)


@app.route("/logout")

@login_required
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/store_score", methods=["POST"])
@login_required
def store_score():

    db = get_db()

    waveCount = int(request.form["waveCount"])

    conflict_user = db.execute(''' SELECT * FROM wave_leaderboard
               WHERE user_id = ?''', (g.user,)).fetchone() 
    

    user_wave = db.execute(""" SELECT waveCount FROM wave_leaderboard WHERE user_id=? """, (g.user, )).fetchone()

    if  user_wave is not None and conflict_user is not None and waveCount > user_wave[0]:
        db.execute(""" UPDATE wave_leaderboard SET waveCount = ? WHERE user_id = ? """, (waveCount, g.user))
    else:
        db.execute(""" INSERT INTO wave_leaderboard (user_id, waveCount) VALUES (?, ?); """, (g.user, waveCount))
    db.commit() 

    return render_template("endless.html")


