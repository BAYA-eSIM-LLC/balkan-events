from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

country_regions = Table(
    'country_regions',
    Base.metadata,
    Column('country_id', Integer, ForeignKey('countries.id'), primary_key=True),
    Column('region_id', Integer, ForeignKey('regions.id'), primary_key=True)
)

class Country(Base):
    __tablename__ = "countries"
    id = Column(Integer, primary_key=True)
    iso_alpha2 = Column(String(2), unique=True, nullable=False)
    iso_alpha3 = Column(String(3), unique=True, nullable=False)
    name_en = Column(String(100), nullable=False)
    name_local = Column(String(100))
    phone_code = Column(String(10))
    currency_code = Column(String(3))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    cities = relationship("City", back_populates="country")
    regions = relationship("Region", secondary=country_regions, back_populates="countries")

class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name_en = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    countries = relationship("Country", secondary=country_regions, back_populates="regions")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    name = Column(String(150), nullable=False)
    name_alt = Column(String(150))
    region_admin = Column(String(100))
    postal_code = Column(String(20))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    timezone = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    country = relationship("Country", back_populates="cities")
