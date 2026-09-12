package com.clinicaalamillo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Bean
    public OpenAPI clinicaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Clínica Dental Alamillo – API REST")
                        .version("1.0.0")
                        .description("""
                                API para la gestión de citas y servicios de la Clínica Dental Alamillo (Sevilla).

                                **Base URL producción:** `https://api.clinicadentalalamillo.com`

                                **Nota:** Los endpoints administrativos (GET /appointments, PATCH /appointments/{id}/status)
                                requieren autenticación en producción.
                                """)
                        .contact(new Contact()
                                .name("Clínica Dental Alamillo")
                                .email("info@clinicadentalalamillo.com")
                                .url("https://clinicadentalalamillo.com"))
                        .license(new License().name("Privado – uso interno")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Desarrollo local"),
                        new Server().url("https://api.clinicadentalalamillo.com").description("Producción")
                ));
    }
}
