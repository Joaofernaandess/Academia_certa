package com.academia.server.repositories;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.UUID;

public abstract class BaseRepository {
    protected final DataSource dataSource;

    protected BaseRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    protected Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    protected UUID getUuidNullable(ResultSet rs, String col) throws SQLException {
        Object val = rs.getObject(col);
        return val instanceof UUID u ? u : (val != null ? UUID.fromString(val.toString()) : null);
    }

    protected void setUuid(PreparedStatement statement, int index, UUID value) throws SQLException {
        boolean postgres = "PostgreSQL".equalsIgnoreCase(
                statement.getConnection().getMetaData().getDatabaseProductName());
        if (value == null) {
            statement.setNull(index, postgres ? Types.OTHER : Types.CHAR);
        } else if (postgres) {
            statement.setObject(index, value);
        } else {
            statement.setString(index, value.toString());
        }
    }

    protected LocalDateTime getDateTimeNullable(ResultSet rs, String col) throws SQLException {
        Timestamp ts = rs.getTimestamp(col);
        return ts != null ? ts.toLocalDateTime() : null;
    }
}