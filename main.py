from flask import Flask, render_template, Response

app = Flask(__name__)

@app.route('/')
def index() -> str:
    return render_template('index.html')

#@app.route('/api/image/<filename>')
#def get_image(filename: str) -> Response:
#    from flask import send_from_directory
#    return send_from_directory('static', filename)
#
#@app.after_request
#def add_cors_headers(response) -> tuple[Response, int]:
#    response.headers['Access-Control-Allow-Origin'] = '*'
#    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
#    return response

if __name__ == '__main__':
    app.run()

