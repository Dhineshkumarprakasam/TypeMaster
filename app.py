import sqlitecloud
import mysql.connector as sc
from flask import Flask, render_template, request, flash, redirect, url_for,jsonify,session
app = Flask(__name__)
app.secret_key="dhinesh_typing_app"

con_url="sqlitecloud://cvwila88sk.g5.sqlite.cloud:8860/type?apikey=cxhqnmn4jWRfmDVBbGZKsgPRLCP7iB389Mg2Swl2q9c"
con=sqlitecloud.connect(con_url)


@app.route("/",methods=['POST','GET'])
def index():
    global email
    if request.method=="POST":
        email=request.form.get('email')
        session['email']=email
        password=request.form.get('password')
        cursor=con.cursor()
        q1="Select * from users where email=?"
        q2="Insert into users values(?,?)"
        cursor.execute(q1,(email,))
        data=cursor.fetchall()
        cursor.close()

        if data:
            if password==data[0][1]:
                return render_template("dashboard.html",email=session.get('email',''))
            else:
                flash("Incorrect Password", "danger")
                return redirect(url_for('index'))
        
        else:
            cursor=con.cursor()
            cursor.execute(q2,(session.get('email',''),password))
            con.commit()
            cursor.close()
            return render_template("dashboard.html",email=session.get('email',''))
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html",email=session.get('email',''))

@app.route('/start_test')
def start_test():
    return render_template("start.html")

@app.route('/gameover', methods=['POST'])
def receive_data():
    data = request.json 
    if data:
        session['game_stats'] = data
        session.modified = True
        return jsonify({"redirect": url_for('gameover_page')})

    return jsonify({"error": "No data received"}), 400

@app.route('/gameover_page', methods=['GET'])
def gameover_page():
    game_stats = session.get('game_stats', {})
    cursor=con.cursor()
    q1="insert into type(email,accuracy,error,total_typed,total_wrong,wpm) values(?,?,?,?,?,?)"
    wpm=game_stats.get('wpm', 0)
    accuracy=game_stats.get('accuracy', 0)
    error=game_stats.get('errorRate', 0)
    total_words=game_stats.get('total_words', 0)
    total_wrong=game_stats.get('total_wrong_words', 0)
    cursor.execute(q1,(session.get('email',''),accuracy,error,total_words,total_wrong,wpm))
    cursor.close()
    con.commit()
    return render_template("gameover.html", game_stats=game_stats)

@app.route('/leaderboard')
def leaderboard():
    cursor=con.cursor()
    cursor.execute("select email, max(wpm) as wpm from type group by email order by wpm desc")
    data=cursor.fetchall()
    return render_template("leaderboard.html",data=data)

if __name__=="__main__":
    app.run(debug=True)