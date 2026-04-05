from datetime import date
from sqlalchemy import create_engine, Column, Integer, Date, Enum as SQLEnum, func
from sqlalchemy.orm import declarative_base, sessionmaker
import enum

Base = declarative_base()

class TType(enum.Enum):
    income = "income"
    expense = "expense"

class T(Base):
    __tablename__ = "t"
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    type = Column(SQLEnum(TType))
    amount = Column(Integer)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
db = Session()

db.add_all([
    T(date=date(2023, 1, 1), type=TType.income, amount=100),
    T(date=date(2023, 1, 15), type=TType.expense, amount=50),
])
db.commit()

q = db.query(
    func.extract('year', T.date),
    func.extract('month', T.date),
    T.type,
    func.sum(T.amount)
).filter(T.type == 'income').group_by(
    func.extract('year', T.date),
    func.extract('month', T.date),
    T.type
).all()

print(q)
