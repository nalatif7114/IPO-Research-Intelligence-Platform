"""Generic async repository providing reusable CRUD operations."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Async repository that wraps common database operations for a model.

    Subclass and set ``model`` to the desired SQLAlchemy model class::

        class UserRepository(BaseRepository[User]):
            model = User
    """

    model: type[ModelType]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, record_id: uuid.UUID) -> ModelType | None:
        """Fetch a single record by its primary key.

        Args:
            record_id: UUID of the record.

        Returns:
            The model instance or ``None`` if not found.
        """
        return await self.session.get(self.model, record_id)

    async def get_all(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> Sequence[ModelType]:
        """Return a paginated list of records.

        Args:
            skip: Number of rows to skip.
            limit: Maximum number of rows to return.
            include_deleted: When ``False`` (default) soft-deleted rows are
                excluded.

        Returns:
            A sequence of model instances.
        """
        stmt = select(self.model)
        if not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)  # noqa: E712
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, data: dict[str, Any]) -> ModelType:
        """Insert a new record.

        Args:
            data: Column-name → value mapping.

        Returns:
            The newly created model instance.
        """
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, record_id: uuid.UUID, data: dict[str, Any]) -> ModelType | None:
        """Update an existing record.

        Args:
            record_id: UUID of the record to update.
            data: Column-name → new-value mapping.

        Returns:
            The updated model instance, or ``None`` if not found.
        """
        instance = await self.get_by_id(record_id)
        if instance is None:
            return None
        for key, value in data.items():
            setattr(instance, key, value)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def soft_delete(self, record_id: uuid.UUID) -> ModelType | None:
        """Mark a record as deleted without physically removing it.

        Args:
            record_id: UUID of the record.

        Returns:
            The updated model instance, or ``None`` if not found.
        """
        return await self.update(
            record_id,
            {"is_deleted": True, "deleted_at": datetime.now(tz=timezone.utc)},
        )

    async def hard_delete(self, record_id: uuid.UUID) -> bool:
        """Permanently remove a record from the database.

        Args:
            record_id: UUID of the record.

        Returns:
            ``True`` if the record was deleted, ``False`` if it was not found.
        """
        instance = await self.get_by_id(record_id)
        if instance is None:
            return False
        await self.session.delete(instance)
        await self.session.flush()
        return True
