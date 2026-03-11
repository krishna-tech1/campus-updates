from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    image = Column(String, nullable=True)
    author_name = Column(String, nullable=False)
    author_email = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime)


