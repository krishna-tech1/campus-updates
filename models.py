
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    image = Column(String, nullable=True)   # 👈 NEW
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)


