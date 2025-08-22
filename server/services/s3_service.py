import boto3


def upload_file_to_s3(s3_client, bucket, key, file_obj):
    """
    Upload file to S3 and return the file URL.
    """
    s3_client.upload_fileobj(file_obj, bucket, key)


def delete_file_from_s3(s3_client, bucket, key):
    """
    Delete file from S3.
    """
    s3_client.delete_object(Bucket=bucket, Key=key)
