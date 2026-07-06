# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies in a separate step to leverage Docker cache
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the compiled JAR
COPY --from=build /app/target/sisvet-backend-*.jar app.jar

# Directory for clinical uploads (referenced in application.yml)
RUN mkdir -p uploads/clinico

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
