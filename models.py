from sqlalchemy import Column, String, Integer, Sequence, DateTime, Computed
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    uid = Column(Integer, Sequence('users_uid_seq', start=10000, increment=1), primary_key=True, index=True)
    uid_formatted = Column(String, Computed("'I-' || uid", persisted=True))  # ✅ Store "I-10001"
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # ✅ Reset token fields
    reset_token = Column(String, unique=True, nullable=True)  # Stores the reset token
    reset_token_expiry = Column(DateTime, nullable=True)  # Stores the expiry time of the token

    def set_reset_token(self, token: str, expiry_minutes: int = 15):
        """Sets a reset token with an expiry time (default 15 minutes)."""
        self.reset_token = token
        self.reset_token_expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)

    def is_reset_token_valid(self) -> bool:
        """Checks if the reset token is still valid."""
        return self.reset_token and self.reset_token_expiry and self.reset_token_expiry > datetime.utcnow()
