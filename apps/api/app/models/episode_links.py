from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class EpisodeCharacter(SQLModel, table=True):
    __tablename__ = "episode_character"
    __table_args__ = (
        UniqueConstraint("episode_id", "character_id", "role", name="uq_ep_char_role"),
    )

    id: int | None = Field(default=None, primary_key=True)
    episode_id: int = Field(foreign_key="episode.id", index=True)
    character_id: int = Field(foreign_key="character.id", index=True)
    role: str | None = None  # "featured", "supporting", "antagonist"


class EpisodeLocation(SQLModel, table=True):
    __tablename__ = "episode_location"
    __table_args__ = (
        UniqueConstraint("episode_id", "location_id", name="uq_ep_loc"),
    )

    id: int | None = Field(default=None, primary_key=True)
    episode_id: int = Field(foreign_key="episode.id", index=True)
    location_id: int = Field(foreign_key="location.id", index=True)
    scene_context: str | None = None
