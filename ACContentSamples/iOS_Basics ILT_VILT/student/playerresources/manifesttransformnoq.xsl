<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.imsproject.org/xsd/imscp_rootv1p1p2" version="1.0">
	<xsl:template match="/">
		<br/>
		<xsl:for-each select="s:manifest/s:organizations/s:organization/s:item">
			<h5>
				<xsl:value-of select="s:title"/>
			</h5>
			<ul>
				<xsl:for-each select="s:item">
					<li>
						<a>
							<xsl:attribute name="href">
								<xsl:call-template name="url">
									<xsl:with-param name="id" select="@identifierref"/>
								</xsl:call-template>
								<xsl:text>?hideErrors=1</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="target">contentFrame</xsl:attribute>
							<xsl:value-of select="s:title"/>
						</a>
					</li>
				</xsl:for-each>
			</ul>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="url">
		<xsl:param name="id"/>
		<xsl:value-of select="/s:manifest/s:resources/s:resource[@identifier=$id]/@href"/>
	</xsl:template>
</xsl:stylesheet>
