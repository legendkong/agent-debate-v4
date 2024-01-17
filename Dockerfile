# set base image (host OS)
FROM python:3.10-bookworm

# set the working directory in the container
WORKDIR /code
COPY . /code
COPY pip.conf /etc/pip.conf

# Install dependencies from the requirements file
RUN pip install -r "requirements.new" && rm /etc/pip.conf

# Install gevent for asynchronous workers
RUN pip install gevent

# Create a non-root user and switch to it
RUN useradd -u 1001 -m appuser
USER 1001

# Expose the port the app runs on
EXPOSE 8080

ENV PYTHONPATH=/code/src

# # Run the Flask app using the built-in server
# # CMD ["python", "src/server.py"]
# CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "src.server:app"]


# Run the Flask app using Gunicorn with increased timeout and gevent workers
CMD ["gunicorn", "-w", "6", "-k", "gevent", "-b", "0.0.0.0:8080", "--timeout", "1000", "src.server:app"]