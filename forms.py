from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, PasswordField, RadioField, IntegerField, FloatField, BooleanField
from wtforms.validators import InputRequired, EqualTo


class RegistrationForm(FlaskForm):
    user_id = StringField('', validators=[InputRequired()])
    password = PasswordField('', validators=[InputRequired()])
    password2 = PasswordField('', validators=[InputRequired(), EqualTo("password")])
    submit = SubmitField("Submit")

class LoginForm(FlaskForm):
    user_id = StringField("", validators=[InputRequired()])
    password = PasswordField("", validators=[InputRequired()])
    submit = SubmitField("Submit")
